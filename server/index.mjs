import { clerkMiddleware, getAuth } from '@clerk/express';
import { verifyWebhook } from '@clerk/backend/webhooks';
import cors from 'cors';
import express from 'express';
import {
  checkSupabaseConnection,
  getSupabaseAdminClient,
  SUPABASE_PROJECT_REF,
} from './db.mjs';
import { env } from './env.mjs';
import {
  getOrCreateProfile,
  softDeleteProfile,
  upsertProfileFromClerkUser,
} from './profiles.mjs';
import {
  prepareAudioForStorage,
  removeStoredObject,
  uploadOriginalAudioForJob,
} from './storage.mjs';
import { runTranslationProviderPipeline } from './translation-pipeline.mjs';
import {
  createTranslationJob,
  getTranslationForUser,
  listTranslationsForUser,
  markTranslationJobFailed,
  markTranslationJobRunning,
  markTranslationJobSucceeded,
  updateTranslationJobStorageMetadata,
  updateTranslationJobTriggerRunId,
} from './translations.mjs';
import { translateAudioJob } from '../trigger/translate-audio-job.mjs';

const {
  PORT,
  HOST,
  MAX_JSON_BODY_SIZE: BODY_LIMIT,
  CLERK_CONFIGURED,
  CLERK_WEBHOOK_SIGNING_SECRET,
  CLERK_WEBHOOK_CONFIGURED,
  DARIJA_ASR_BASE_URL: ASR_BASE_URL,
  DARIJA_ASR_TRANSCRIBE_URL: ASR_TRANSCRIBE_URL,
  DARIJA_ASR_API_KEY: ASR_API_KEY,
  OPENAI_API_KEY,
  OPENAI_CONSOLIDATION_MODEL: CONSOLIDATION_MODEL,
  OPENAI_TRANSLATION_MODEL: TRANSLATION_MODEL,
  OPENAI_TRANSCRIPTION_MODEL,
  SUPABASE_CONFIGURED,
  TRIGGER_CONFIGURED,
} = env;

const app = express();

app.use(CLERK_CONFIGURED ? clerkMiddleware() : (_req, _res, next) => next());
app.use(cors());

function nowIso() {
  return new Date().toISOString();
}

function traceFromRequest(req) {
  return req.get('X-Trace-Id') || `server-${Date.now().toString(36)}`;
}

function logTrace(traceId, message, details = undefined) {
  const suffix = details ? ` ${JSON.stringify(details)}` : '';

  console.log(`[${nowIso()}] [${traceId}] ${message}${suffix}`);
}

function transcriptLengths(payload) {
  return {
    openaiArabicText: payload.openaiArabicText?.length || 0,
    darijaArabicText: payload.darijaArabicText?.length || 0,
    consolidatedArabicText: payload.consolidatedArabicText?.length || 0,
    englishText: payload.englishText?.length || 0,
  };
}

function safeErrorMessage(error) {
  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message.trim().slice(0, 500);
  }

  return 'Translation processing failed.';
}

function safeErrorCode(error, fallback = 'provider_error') {
  if (typeof error?.code === 'string' && error.code.trim()) {
    return error.code.trim().slice(0, 80);
  }

  if (Number.isInteger(error?.status)) {
    return `http_${error.status}`;
  }

  if (typeof error?.name === 'string' && error.name.trim()) {
    return error.name.trim().slice(0, 80);
  }

  return fallback;
}

function firstRelatedRow(row, relationName) {
  const related = row?.[relationName];

  if (Array.isArray(related)) {
    return related[0] || null;
  }

  return related || null;
}

function previewText(value, maxLength = 160) {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim().replace(/\s+/g, ' ');

  if (!normalized) {
    return null;
  }

  return normalized.length > maxLength
    ? `${normalized.slice(0, maxLength - 3)}...`
    : normalized;
}

function modelsFromResult(result) {
  const models = result?.model_metadata?.models;

  if (!models || typeof models !== 'object' || Array.isArray(models)) {
    return {};
  }

  return {
    openaiTranscription: models.openaiTranscription || null,
    darija: models.darija || null,
    consolidation: models.consolidation || null,
    translation: models.translation || null,
  };
}

function toTranslationListItem(row) {
  const result = firstRelatedRow(row, 'translation_results');

  return {
    id: row.id,
    status: row.status,
    filename: row.source_filename,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    consolidatedArabicPreview: previewText(result?.consolidated_arabic_text),
    englishPreview: previewText(result?.english_text),
    models: modelsFromResult(result),
  };
}

function toProviderRunSummary(providerRun) {
  return {
    id: providerRun.id,
    provider: providerRun.provider,
    operation: providerRun.operation,
    model: providerRun.model,
    status: providerRun.status,
    latencyMs: providerRun.latency_ms,
    errorCode: providerRun.error_code,
    errorMessage: providerRun.error_message,
    startedAt: providerRun.started_at,
    completedAt: providerRun.completed_at,
    createdAt: providerRun.created_at,
  };
}

function toTranslationDetail(row) {
  const result = firstRelatedRow(row, 'translation_results');
  const providerRuns = Array.isArray(row.provider_runs)
    ? [...row.provider_runs].sort((a, b) =>
        String(a.created_at).localeCompare(String(b.created_at)),
      )
    : [];

  return {
    id: row.id,
    status: row.status,
    filename: row.source_filename,
    sourceAudioBytes: row.source_audio_bytes,
    traceId: row.trace_id,
    errorCode: row.error_code,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    result: result
      ? {
          openaiArabicText: result.openai_arabic_text,
          darijaArabicText: result.darija_arabic_text,
          consolidatedArabicText: result.consolidated_arabic_text,
          englishText: result.english_text,
          modelMetadata: result.model_metadata || {},
          createdAt: result.created_at,
          updatedAt: result.updated_at,
        }
      : null,
    providerRuns: providerRuns.map(toProviderRunSummary),
  };
}

function httpError(status, message, cause) {
  const error = new Error(message);
  error.status = status;
  error.cause = cause;
  return error;
}

function validatePayload(body) {
  const filename = typeof body?.filename === 'string' ? body.filename.trim() : '';
  const audioBase64 =
    typeof body?.audio_base64 === 'string' ? body.audio_base64.trim() : '';

  if (!filename) {
    throw httpError(400, 'filename is required.');
  }

  if (!audioBase64) {
    throw httpError(400, 'audio_base64 is required.');
  }

  return { filename, audioBase64 };
}

function requireTriggerRuntime() {
  if (!TRIGGER_CONFIGURED) {
    throw httpError(
      500,
      'Trigger.dev is not configured. Set TRIGGER_SECRET_KEY for async translation.',
    );
  }
}

function requireClerkSession(req, res, next) {
  if (!CLERK_CONFIGURED) {
    return next(
      httpError(
        500,
        'Clerk auth is not configured. Set CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY.',
      ),
    );
  }

  const auth = getAuth(req);

  if (!auth.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.clerkAuth = {
    userId: auth.userId,
    sessionId: auth.sessionId,
  };

  next();
}

async function ensureProfileForRequest(req, res, next) {
  try {
    const traceId = traceFromRequest(req);
    const profile = await getOrCreateProfile({
      clerkUserId: req.clerkAuth.userId,
    });

    req.profile = {
      id: profile.id,
      clerkUserId: profile.clerk_user_id,
    };

    logTrace(traceId, 'Profile resolved for authenticated request', {
      userId: req.clerkAuth.userId,
      profileId: profile.id,
    });

    next();
  } catch (error) {
    error.traceId = traceFromRequest(req);
    next(error);
  }
}

function buildWebhookRequest(req) {
  if (!Buffer.isBuffer(req.body)) {
    throw httpError(400, 'Webhook body must be raw application/json.');
  }

  const headers = new Headers();

  for (const [name, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(name, item);
      }
    } else if (value !== undefined) {
      headers.set(name, value);
    }
  }

  return new Request(`${req.protocol}://${req.get('host')}${req.originalUrl}`, {
    method: req.method,
    headers,
    body: req.body,
  });
}

function getClerkWebhookUserId(event) {
  return typeof event?.data?.id === 'string' ? event.data.id : null;
}

function wrapWebhookDatabaseError(operation, error) {
  return httpError(500, `Clerk webhook database operation failed: ${operation}.`, {
    code: error?.code,
    name: error?.name,
    status: error?.status,
  });
}

async function recordClerkWebhookEvent({ eventId, event }) {
  const row = {
    event_id: eventId,
    event_type: event.type,
    clerk_user_id: getClerkWebhookUserId(event),
    payload: event,
  };

  const { data, error } = await getSupabaseAdminClient()
    .from('clerk_webhook_events')
    .insert(row)
    .select('id, processed_at')
    .single();

  if (!error) {
    return { duplicate: false, processedAt: data.processed_at };
  }

  if (error.code !== '23505') {
    throw wrapWebhookDatabaseError('record_clerk_webhook_event', error);
  }

  const { data: existingEvent, error: lookupError } =
    await getSupabaseAdminClient()
      .from('clerk_webhook_events')
      .select('id, processed_at')
      .eq('event_id', eventId)
      .maybeSingle();

  if (lookupError) {
    throw wrapWebhookDatabaseError('lookup_duplicate_clerk_webhook_event', lookupError);
  }

  return {
    duplicate: true,
    processedAt: existingEvent?.processed_at || null,
  };
}

async function markClerkWebhookEventProcessed(eventId) {
  const { error } = await getSupabaseAdminClient()
    .from('clerk_webhook_events')
    .update({ processed_at: new Date().toISOString() })
    .eq('event_id', eventId);

  if (error) {
    throw wrapWebhookDatabaseError('mark_clerk_webhook_event_processed', error);
  }
}

async function processClerkWebhookEvent(event) {
  switch (event.type) {
    case 'user.created':
    case 'user.updated':
      return upsertProfileFromClerkUser(event.data);
    case 'user.deleted':
      return event.data?.id ? softDeleteProfile(event.data.id) : null;
    default:
      return null;
  }
}

async function handleClerkWebhook(req, res, next) {
  const traceId = traceFromRequest(req);
  const eventId = req.get('svix-id');
  let verified = false;

  try {
    if (!CLERK_WEBHOOK_CONFIGURED) {
      throw httpError(500, 'CLERK_WEBHOOK_SIGNING_SECRET is not configured.');
    }

    const event = await verifyWebhook(buildWebhookRequest(req), {
      signingSecret: CLERK_WEBHOOK_SIGNING_SECRET,
    });
    verified = true;
    const clerkUserId = getClerkWebhookUserId(event);

    logTrace(traceId, 'Clerk webhook verified', {
      eventId,
      eventType: event.type,
      clerkUserId,
    });

    const eventRecord = await recordClerkWebhookEvent({ eventId, event });

    if (eventRecord.duplicate && eventRecord.processedAt) {
      logTrace(traceId, 'Clerk webhook duplicate already processed', {
        eventId,
        eventType: event.type,
        clerkUserId,
      });

      return res.json({ ok: true, duplicate: true });
    }

    if (eventRecord.duplicate) {
      logTrace(traceId, 'Clerk webhook duplicate pending processing', {
        eventId,
        eventType: event.type,
        clerkUserId,
      });
    }

    await processClerkWebhookEvent(event);
    await markClerkWebhookEventProcessed(eventId);

    logTrace(traceId, 'Clerk webhook processed', {
      eventId,
      eventType: event.type,
      clerkUserId,
    });

    res.json({ ok: true, duplicate: eventRecord.duplicate });
  } catch (error) {
    error.traceId = traceId;

    if (!verified && !error.status) {
      error.status = 400;
      error.message = 'Invalid Clerk webhook signature.';
    }

    next(error);
  }
}

app.post(
  '/v1/webhooks/clerk',
  express.raw({ type: 'application/json', limit: BODY_LIMIT }),
  handleClerkWebhook,
);
app.use(express.json({ limit: BODY_LIMIT }));

app.get('/health', (req, res) => {
  const traceId = traceFromRequest(req);
  const payload = {
    ok: true,
    service: 'darija-to-english-api',
    dependencies: {
      clerk: CLERK_CONFIGURED,
      darija_asr: Boolean(ASR_BASE_URL && ASR_API_KEY),
      openai: Boolean(OPENAI_API_KEY),
      supabase: SUPABASE_CONFIGURED,
    },
    models: {
      openai_transcription: OPENAI_TRANSCRIPTION_MODEL,
      consolidation: CONSOLIDATION_MODEL,
      translation: TRANSLATION_MODEL,
    },
  };

  logTrace(traceId, 'Health check', {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    responseShape: Object.keys(payload),
    models: payload.models,
    clerkConfigured: CLERK_CONFIGURED,
    supabaseConfigured: SUPABASE_CONFIGURED,
  });

  res.json(payload);
});

app.get('/health/supabase', async (req, res) => {
  const traceId = traceFromRequest(req);
  const result = await checkSupabaseConnection();
  const payload = {
    ok: result.ok,
    service: 'darija-to-english-api',
    dependency: 'supabase',
    projectRef: SUPABASE_PROJECT_REF,
    table: result.table,
    status: result.status,
    rowCount: result.rowCount,
    durationMs: result.durationMs,
    errorCode: result.errorCode,
    errorName: result.errorName,
  };

  logTrace(traceId, 'Supabase smoke check', {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    ok: payload.ok,
    projectRef: payload.projectRef,
    table: payload.table,
    status: payload.status,
    rowCount: payload.rowCount,
    errorCode: payload.errorCode,
    errorName: payload.errorName,
    durationMs: payload.durationMs,
  });

  res.status(payload.ok ? 200 : 503).json(payload);
});

async function handleListTranslations(req, res, next) {
  const traceId = traceFromRequest(req);

  try {
    const { items, nextCursor } = await listTranslationsForUser({
      clerkUserId: req.clerkAuth.userId,
      limit: req.query.limit,
      cursor: req.query.cursor,
    });
    const payload = {
      items: items.map(toTranslationListItem),
      nextCursor,
    };

    logTrace(traceId, 'Translation history list returned', {
      userId: req.clerkAuth.userId,
      itemCount: payload.items.length,
      nextCursor: payload.nextCursor,
    });

    res.json(payload);
  } catch (error) {
    error.traceId = traceId;
    next(error);
  }
}

async function handleGetTranslation(req, res, next) {
  const traceId = traceFromRequest(req);

  try {
    const translation = await getTranslationForUser({
      clerkUserId: req.clerkAuth.userId,
      translationId: req.params.id,
    });

    if (!translation) {
      return res.status(404).json({ error: 'Translation not found.' });
    }

    logTrace(traceId, 'Translation history detail returned', {
      userId: req.clerkAuth.userId,
      translationId: translation.id,
      status: translation.status,
    });

    res.json(toTranslationDetail(translation));
  } catch (error) {
    error.traceId = traceId;
    next(error);
  }
}

app.get('/v1/translations', requireClerkSession, handleListTranslations);
app.get('/v1/translations/:id', requireClerkSession, handleGetTranslation);

function triggerRunIdFromHandle(handle) {
  return (
    handle?.id ||
    handle?.runId ||
    handle?.run?.id ||
    handle?.runs?.[0]?.id ||
    null
  );
}

async function dispatchTranslationJob({ jobId }) {
  return translateAudioJob.trigger(
    { job_id: jobId },
    {
      idempotencyKey: `translation-job:${jobId}`,
      tags: ['darija-mobile', `job:${jobId}`],
    },
  );
}

async function handleCreateTranslation(req, res, next) {
  const traceId = traceFromRequest(req);
  const startedAt = Date.now();
  let translationJob = null;
  let storedAudio = null;

  try {
    requireTriggerRuntime();

    const payload = validatePayload(req.body);
    const audio = prepareAudioForStorage(payload);
    const audioBytes = audio.sizeBytes;
    const clerkUserId = req.clerkAuth.userId;

    logTrace(traceId, 'Async translation request received', {
      ip: req.ip,
      userId: clerkUserId,
      filename: audio.filename,
      base64Chars: audio.audioBase64.length,
      audioBytes,
      audioMimeType: audio.mimeType,
      contentLength: req.get('Content-Length'),
    });

    translationJob = await createTranslationJob({
      clerkUserId,
      profileId: req.profile?.id,
      filename: audio.filename,
      audioBytes,
      traceId,
    });

    storedAudio = await uploadOriginalAudioForJob({
      clerkUserId,
      jobId: translationJob.id,
      audio,
    });

    try {
      await updateTranslationJobStorageMetadata({
        jobId: translationJob.id,
        clerkUserId,
        audioBucket: storedAudio.bucket,
        audioObjectKey: storedAudio.objectKey,
        audioSizeBytes: storedAudio.sizeBytes,
        audioMimeType: storedAudio.mimeType,
        audioRetentionExpiresAt: storedAudio.retentionExpiresAt,
      });
    } catch (metadataError) {
      try {
        await removeStoredObject({
          bucket: storedAudio.bucket,
          objectKey: storedAudio.objectKey,
        });
        storedAudio = null;
      } catch (cleanupError) {
        logTrace(traceId, 'Audio cleanup after async metadata failure failed', {
          jobId: translationJob.id,
          bucket: storedAudio.bucket,
          errorName: cleanupError?.name,
          errorCode: cleanupError?.code,
        });
      }

      throw metadataError;
    }

    const triggerHandle = await dispatchTranslationJob({ jobId: translationJob.id });
    const triggerRunId = triggerRunIdFromHandle(triggerHandle);

    if (!triggerRunId) {
      throw httpError(502, 'Trigger.dev dispatch did not return a run ID.');
    }

    await updateTranslationJobTriggerRunId({
      jobId: translationJob.id,
      clerkUserId,
      triggerRunId,
    });

    const responsePayload = {
      jobId: translationJob.id,
      translationJobId: translationJob.id,
      status: 'queued',
      triggerRunId,
      createdAt: translationJob.created_at,
      detailUrl: `/v1/translations/${translationJob.id}`,
    };

    logTrace(traceId, 'Async translation queued', {
      jobId: translationJob.id,
      triggerRunId,
      durationMs: Date.now() - startedAt,
    });

    res.status(202).json(responsePayload);
  } catch (error) {
    error.traceId = traceId;

    if (translationJob?.id && req.clerkAuth?.userId) {
      try {
        await markTranslationJobFailed({
          jobId: translationJob.id,
          clerkUserId: req.clerkAuth.userId,
          errorCode: safeErrorCode(error, 'async_dispatch_failed'),
          errorMessage: safeErrorMessage(error),
        });
      } catch (recordError) {
        logTrace(traceId, 'Async translation job failure recording failed', {
          jobId: translationJob.id,
          errorName: recordError?.name,
          errorCode: recordError?.supabase?.code,
        });
      }
    }

    next(error);
  }
}

app.post(
  '/v1/translations',
  requireClerkSession,
  ensureProfileForRequest,
  handleCreateTranslation,
);

async function handleTranslateAudio(req, res, next) {
  const traceId = traceFromRequest(req);
  const startedAt = Date.now();
  let translationJob = null;
  let storedAudio = null;

  try {
    const payload = validatePayload(req.body);
    const audio = prepareAudioForStorage(payload);
    const providerPayload = {
      filename: audio.filename,
      audioBase64: audio.audioBase64,
    };
    const audioBytes = audio.sizeBytes;
    const clerkUserId = req.clerkAuth.userId;

    logTrace(traceId, 'Translate audio request received', {
      ip: req.ip,
      userId: clerkUserId,
      filename: audio.filename,
      base64Chars: audio.audioBase64.length,
      audioBytes,
      audioMimeType: audio.mimeType,
      contentLength: req.get('Content-Length'),
    });

    translationJob = await createTranslationJob({
      clerkUserId,
      profileId: req.profile?.id,
      filename: audio.filename,
      audioBytes,
      traceId,
    });

    storedAudio = await uploadOriginalAudioForJob({
      clerkUserId,
      jobId: translationJob.id,
      audio,
    });

    try {
      await updateTranslationJobStorageMetadata({
        jobId: translationJob.id,
        clerkUserId,
        audioBucket: storedAudio.bucket,
        audioObjectKey: storedAudio.objectKey,
        audioSizeBytes: storedAudio.sizeBytes,
        audioMimeType: storedAudio.mimeType,
        audioRetentionExpiresAt: storedAudio.retentionExpiresAt,
      });
    } catch (metadataError) {
      try {
        await removeStoredObject({
          bucket: storedAudio.bucket,
          objectKey: storedAudio.objectKey,
        });
        storedAudio = null;
      } catch (cleanupError) {
        logTrace(traceId, 'Audio cleanup after metadata failure failed', {
          jobId: translationJob.id,
          bucket: storedAudio.bucket,
          errorName: cleanupError?.name,
          errorCode: cleanupError?.code,
        });
      }

      throw metadataError;
    }

    await markTranslationJobRunning({
      jobId: translationJob.id,
      clerkUserId,
    });

    const pipelineResult = await runTranslationProviderPipeline({
      jobId: translationJob.id,
      traceId,
      clerkUserId,
      filename: providerPayload.filename,
      audioBase64: providerPayload.audioBase64,
      audioBytes,
      audioStorageMetadata: {
        audioBucket: storedAudio.bucket,
        audioObjectKey: storedAudio.objectKey,
        audioMimeType: storedAudio.mimeType,
      },
      logTrace,
    });
    const {
      openaiAsr,
      darijaAsr,
      consolidatedArabicText,
      englishText,
      models,
    } = pipelineResult;

    await markTranslationJobSucceeded({
      jobId: translationJob.id,
      clerkUserId,
    });

    const responsePayload = {
      jobId: translationJob.id,
      translationJobId: translationJob.id,
      openaiArabicText: openaiAsr.text,
      darijaArabicText: darijaAsr.text,
      consolidatedArabicText,
      englishText,
      transcript: consolidatedArabicText,
      transcripts: {
        modal: darijaAsr.text,
        darija: darijaAsr.text,
        openai: openaiAsr.text,
      },
      translation: englishText,
      model: models.translation,
      consolidation_model: models.consolidation,
      asr: {
        model: darijaAsr.model,
        base_model: darijaAsr.base_model,
        filename: darijaAsr.filename,
        audio_bytes: darijaAsr.audio_bytes,
        duration_seconds: darijaAsr.duration_seconds,
      },
      darija_asr: {
        model: darijaAsr.model,
        base_model: darijaAsr.base_model,
        filename: darijaAsr.filename,
        audio_bytes: darijaAsr.audio_bytes,
        duration_seconds: darijaAsr.duration_seconds,
      },
      openai_asr: {
        model: openaiAsr.model,
        filename: openaiAsr.filename,
        audio_bytes: openaiAsr.audio_bytes,
        duration_seconds: openaiAsr.duration_seconds,
      },
    };

    logTrace(traceId, 'Translate audio response payload ready', {
      jobId: translationJob.id,
      responseKeys: Object.keys(responsePayload).sort(),
      transcriptLengths: transcriptLengths(responsePayload),
      models: {
        openai_transcription: responsePayload.openai_asr.model,
        darija: responsePayload.darija_asr.model,
        consolidation: responsePayload.consolidation_model,
        translation: responsePayload.model,
      },
    });

    res.json(responsePayload);

    logTrace(traceId, 'Translate audio response sent', {
      jobId: translationJob.id,
      durationMs: Date.now() - startedAt,
    });
  } catch (error) {
    error.traceId = traceId;

    if (translationJob?.id && req.clerkAuth?.userId) {
      try {
        await markTranslationJobFailed({
          jobId: translationJob.id,
          clerkUserId: req.clerkAuth.userId,
          errorCode: safeErrorCode(error, 'translation_failed'),
          errorMessage: safeErrorMessage(error),
        });
      } catch (recordError) {
        logTrace(traceId, 'Translation job failure recording failed', {
          jobId: translationJob.id,
          errorName: recordError?.name,
          errorCode: recordError?.supabase?.code,
        });
      }
    }

    next(error);
  }
}

app.post(
  '/v1/translate-audio',
  requireClerkSession,
  ensureProfileForRequest,
  handleTranslateAudio,
);
app.post(
  '/translate-audio',
  requireClerkSession,
  ensureProfileForRequest,
  handleTranslateAudio,
);

app.use((error, _req, res, _next) => {
  const status = Number(error.status || 500);
  const message =
    status >= 500 ? error.message || 'Server error.' : error.message || 'Bad request.';

  logTrace(error.traceId || 'unknown', 'Request failed', {
    status,
    message,
    stack: error.stack,
  });

  res.status(status).json({ error: message });
});

app.listen(PORT, HOST, () => {
  logTrace('startup', 'Darija to English API listening', {
    url: `http://${HOST}:${PORT}`,
    bodyLimit: BODY_LIMIT,
    darijaConfigured: Boolean(ASR_BASE_URL && ASR_API_KEY),
    darijaEndpoint: ASR_TRANSCRIBE_URL || null,
    openaiConfigured: Boolean(OPENAI_API_KEY),
    supabaseConfigured: SUPABASE_CONFIGURED,
    models: {
      openai_transcription: OPENAI_TRANSCRIPTION_MODEL,
      consolidation: CONSOLIDATION_MODEL,
      translation: TRANSLATION_MODEL,
    },
  });
});
