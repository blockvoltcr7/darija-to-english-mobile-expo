import { clerkMiddleware, getAuth } from '@clerk/express';
import { verifyWebhook } from '@clerk/backend/webhooks';
import cors from 'cors';
import express from 'express';
import OpenAI, { toFile } from 'openai';
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
  createTranslationJob,
  getTranslationForUser,
  listTranslationsForUser,
  markTranslationJobFailed,
  markTranslationJobRunning,
  markTranslationJobSucceeded,
  PROVIDER_OPERATIONS,
  PROVIDER_RUN_STATUS,
  PROVIDERS,
  recordProviderRun,
  writeTranslationResult,
} from './translations.mjs';

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
  DARIJA_ASR_TIMEOUT_MS: ASR_TIMEOUT_MS,
  OPENAI_API_KEY,
  OPENAI_CONSOLIDATION_MODEL: CONSOLIDATION_MODEL,
  OPENAI_TRANSLATION_MODEL: TRANSLATION_MODEL,
  OPENAI_TRANSCRIPTION_MODEL,
  SUPABASE_CONFIGURED,
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

function base64Payload(audioBase64) {
  return audioBase64.includes(',') ? audioBase64.split(',', 2)[1] : audioBase64;
}

function estimateAudioBytes(audioBase64) {
  const payload = base64Payload(audioBase64);
  const paddingChars = payload.endsWith('==') ? 2 : payload.endsWith('=') ? 1 : 0;

  return Math.max(0, Math.floor((payload.length * 3) / 4) - paddingChars);
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

async function recordProviderOperation({
  traceId,
  jobId,
  clerkUserId,
  provider,
  operation,
  model,
  inputMetadata,
  outputMetadata,
  execute,
}) {
  const startedAt = new Date();
  const startedMs = Date.now();
  let result;

  try {
    result = await execute();
  } catch (error) {
    const completedAt = new Date();

    try {
      await recordProviderRun({
        jobId,
        clerkUserId,
        provider,
        operation,
        model,
        status: PROVIDER_RUN_STATUS.FAILED,
        latencyMs: Date.now() - startedMs,
        inputMetadata,
        errorCode: safeErrorCode(error),
        errorMessage: safeErrorMessage(error),
        startedAt,
        completedAt,
      });
    } catch (recordError) {
      logTrace(traceId, 'Provider failure recording failed', {
        operation,
        provider,
        errorName: recordError?.name,
        errorCode: recordError?.supabase?.code,
      });
    }

    throw error;
  }

  await recordProviderRun({
    jobId,
    clerkUserId,
    provider,
    operation,
    model,
    status: PROVIDER_RUN_STATUS.SUCCEEDED,
    latencyMs: Date.now() - startedMs,
    inputMetadata,
    outputMetadata:
      typeof outputMetadata === 'function' ? outputMetadata(result) : outputMetadata,
    startedAt,
    completedAt: new Date(),
  });

  return result;
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

let openaiClient;

function getOpenAIClient() {
  if (!OPENAI_API_KEY) {
    throw httpError(500, 'OPENAI_API_KEY is not configured.');
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: OPENAI_API_KEY });
  }

  return openaiClient;
}

function httpError(status, message, cause) {
  const error = new Error(message);
  error.status = status;
  error.cause = cause;
  return error;
}

function requireAsrConfig() {
  if (!ASR_BASE_URL) {
    throw httpError(500, 'DARIJA_ASR_BASE_URL is not configured.');
  }

  if (!ASR_API_KEY) {
    throw httpError(500, 'DARIJA_ASR_API_KEY is not configured.');
  }
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

function decodeAudioBase64(audioBase64) {
  return Buffer.from(base64Payload(audioBase64), 'base64');
}

async function transcribeAudio({ filename, audioBase64 }, traceId) {
  requireAsrConfig();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ASR_TIMEOUT_MS);
  const startedAt = Date.now();

  try {
    logTrace(traceId, 'ASR request start', {
      filename,
      base64Chars: audioBase64.length,
      endpoint: ASR_TRANSCRIBE_URL,
    });

    const response = await fetch(ASR_TRANSCRIBE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ASR_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename,
        audio_base64: audioBase64,
      }),
      signal: controller.signal,
    });

    const responseText = await response.text();
    let payload;

    try {
      payload = JSON.parse(responseText);
    } catch {
      payload = null;
    }

    if (!response.ok) {
      logTrace(traceId, 'ASR request failed', {
        status: response.status,
        durationMs: Date.now() - startedAt,
        body: responseText.slice(0, 500),
      });
      throw httpError(
        response.status,
        payload?.detail || payload?.error || responseText || 'ASR request failed.',
      );
    }

    if (!payload?.text) {
      throw httpError(502, 'ASR response did not include transcript text.');
    }

    logTrace(traceId, 'ASR request complete', {
      status: response.status,
      durationMs: Date.now() - startedAt,
      transcriptChars: payload.text.length,
      audioBytes: payload.audio_bytes,
    });

    return payload;
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw httpError(504, 'ASR request timed out.', error);
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function transcribeAudioWithOpenAI({ filename, audioBase64 }, traceId) {
  const client = getOpenAIClient();
  const audioBytes = decodeAudioBase64(audioBase64);
  const startedAt = Date.now();

  logTrace(traceId, 'OpenAI transcription start', {
    filename,
    bytes: audioBytes.length,
    model: OPENAI_TRANSCRIPTION_MODEL,
  });

  const response = await client.audio.transcriptions.create({
    file: await toFile(audioBytes, filename),
    model: OPENAI_TRANSCRIPTION_MODEL,
    language: 'ar',
    prompt:
      'This audio is Moroccan Darija, sometimes mixed with Arabic and French. Preserve names, places, numbers, legal terms, and colloquial phrasing as accurately as possible.',
    response_format: 'json',
  });

  const text = response.text?.trim();

  if (!text) {
    throw httpError(502, 'OpenAI transcription response did not include text.');
  }

  logTrace(traceId, 'OpenAI transcription complete', {
    durationMs: Date.now() - startedAt,
    transcriptChars: text.length,
  });

  return {
    text,
    model: OPENAI_TRANSCRIPTION_MODEL,
    filename,
    audio_bytes: audioBytes.length,
    duration_seconds: Number(((Date.now() - startedAt) / 1000).toFixed(3)),
  };
}

async function consolidateArabicTranscript(
  { openaiTranscript, darijaTranscript },
  traceId,
) {
  const client = getOpenAIClient();
  const startedAt = Date.now();

  logTrace(traceId, 'OpenAI consolidation start', {
    openaiTranscriptChars: openaiTranscript.length,
    darijaTranscriptChars: darijaTranscript.length,
    model: CONSOLIDATION_MODEL,
  });

  const response = await client.responses.create({
    model: CONSOLIDATION_MODEL,
    input: [
      {
        role: 'system',
        content: [
          'You are a Moroccan Darija ASR consolidation specialist.',
          '',
          'Goal:',
          'Produce one final consolidated Arabic/Darija transcript by reconciling multiple ASR hypotheses.',
          '',
          'Core principle:',
          'The inputs are noisy ASR hypotheses, not guaranteed facts. Preserve only what is supported by the inputs. Do not invent missing words, names, document titles, places, numbers, dates, or legal terms.',
          '',
          'Rules:',
          '1) Preserve the speaker\'s meaning exactly.',
          '2) Prefer wording that is more coherent in Moroccan Darija context when hypotheses conflict.',
          '3) Keep Moroccan Darija as spoken; do not convert it into formal MSA unless the speech clearly uses formal wording.',
          '4) Keep French code-switched words naturally, for example: Donc en bref, bien sûr.',
          '5) Correct obvious ASR noise, repetitions, and filler artifacts only when confidence is high.',
          '6) Preserve legal and administrative terms carefully, especially: القايد/القائد، القيادة، وزارة الداخلية، ذوي الحقوق، المرفقات، كروكيات، الاستغلال.',
          '7) Do not create or preserve a supposed name/title from a noisy span unless it is clearly supported by the hypotheses.',
          '8) If a span is unclear in both hypotheses, use [غير واضح] rather than guessing.',
          '9) If one hypothesis is clearly better for a span, rely on it. If both are noisy, choose the safest conservative wording.',
          '10) Preserve ownership and roles accurately. Do not change the father\'s lands into their lands unless the input clearly says that.',
          '11) Output only the final consolidated transcript text.',
          '12) No explanations, no labels, no bullets, and no quotes.',
        ].join('\n'),
      },
      {
        role: 'user',
        content: [
          'Consolidate these two Arabic transcription hypotheses into one final Arabic/Darija transcript.',
          'Important:',
          '- Do not invent content.',
          '- Do not force unclear sounds into names or document titles.',
          '- Use [غير واضح] for unclear spans.',
          '- Prefer the hypothesis that better fits Moroccan Darija and the legal/administrative context.',
          '',
          'Hypothesis A (OpenAI):',
          openaiTranscript,
          '',
          'Hypothesis B (Darija custom model):',
          darijaTranscript,
        ].join('\n'),
      },
    ],
  });

  const consolidatedTranscript = response.output_text?.trim() || openaiTranscript;

  if (!consolidatedTranscript) {
    throw httpError(502, 'OpenAI consolidation response did not include text.');
  }

  logTrace(traceId, 'OpenAI consolidation complete', {
    durationMs: Date.now() - startedAt,
    transcriptChars: consolidatedTranscript.length,
    fallbackToOpenaiText: !response.output_text?.trim(),
  });

  return consolidatedTranscript;
}

app.post(
  '/v1/webhooks/clerk',
  express.raw({ type: 'application/json', limit: BODY_LIMIT }),
  handleClerkWebhook,
);
app.use(express.json({ limit: BODY_LIMIT }));

async function translateConsolidatedTranscript(consolidatedTranscript, traceId) {
  const client = getOpenAIClient();
  const startedAt = Date.now();

  logTrace(traceId, 'OpenAI translation start', {
    transcriptChars: consolidatedTranscript.length,
    model: TRANSLATION_MODEL,
  });

  const response = await client.responses.create({
    model: TRANSLATION_MODEL,
    input: [
      {
        role: 'system',
        content: [
          'You are a Moroccan Darija to English translator specializing in administrative and legal context.',
          'Translate the consolidated Moroccan Darija transcript into clear English.',
          'Rules:',
          '1) Preserve the meaning exactly.',
          '2) Do not add information not present in the transcript.',
          '3) Do not invent names, document titles, dates, numbers, places, or legal details.',
          '4) Translate unclear spans marked [غير واضح] as [unclear].',
          '5) Keep culturally specific terms when needed and briefly clarify them in English, for example:',
          '   - douar = village/community',
          '   - caid = local administrative official',
          '   - caidat/قيادة = local administrative authority',
          '   - ذوي الحقوق = rights-holders/recognized beneficiaries',
          '6) Preserve who owns what and who is submitting the request.',
          '7) Output only the English translation.',
        ].join('\n'),
      },
      {
        role: 'user',
        content: [
          'Translate this consolidated Moroccan Darija transcript into English:',
          consolidatedTranscript,
        ].join('\n'),
      },
    ],
  });

  const translation = response.output_text?.trim();

  if (!translation) {
    throw httpError(502, 'OpenAI translation response did not include text.');
  }

  logTrace(traceId, 'OpenAI translation complete', {
    durationMs: Date.now() - startedAt,
    translationChars: translation.length,
  });

  return translation;
}

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

async function handleTranslateAudio(req, res, next) {
  const traceId = traceFromRequest(req);
  const startedAt = Date.now();
  let translationJob = null;

  try {
    const payload = validatePayload(req.body);
    const audioBytes = estimateAudioBytes(payload.audioBase64);
    const clerkUserId = req.clerkAuth.userId;

    logTrace(traceId, 'Translate audio request received', {
      ip: req.ip,
      userId: clerkUserId,
      filename: payload.filename,
      base64Chars: payload.audioBase64.length,
      approxAudioBytes: audioBytes,
      contentLength: req.get('Content-Length'),
    });

    translationJob = await createTranslationJob({
      clerkUserId,
      profileId: req.profile?.id,
      filename: payload.filename,
      audioBytes,
      traceId,
    });

    await markTranslationJobRunning({
      jobId: translationJob.id,
      clerkUserId,
    });

    logTrace(traceId, 'STT parallel start', {
      jobId: translationJob.id,
      requirement: 'openai_and_darija_required_before_consolidation',
    });

    const [darijaAsrOutcome, openaiAsrOutcome] = await Promise.allSettled([
      recordProviderOperation({
        traceId,
        jobId: translationJob.id,
        clerkUserId,
        provider: PROVIDERS.MODAL,
        operation: PROVIDER_OPERATIONS.MODAL_DARIJA_ASR,
        model: 'modal-darija-asr',
        inputMetadata: {
          filename: payload.filename,
          audioBytes,
        },
        outputMetadata: (result) => ({
          transcriptChars: result.text?.length || 0,
          audioBytes: result.audio_bytes,
          durationSeconds: result.duration_seconds,
          model: result.model,
          baseModel: result.base_model,
        }),
        execute: () => transcribeAudio(payload, traceId),
      }),
      recordProviderOperation({
        traceId,
        jobId: translationJob.id,
        clerkUserId,
        provider: PROVIDERS.OPENAI,
        operation: PROVIDER_OPERATIONS.OPENAI_TRANSCRIPTION,
        model: OPENAI_TRANSCRIPTION_MODEL,
        inputMetadata: {
          filename: payload.filename,
          audioBytes,
          language: 'ar',
        },
        outputMetadata: (result) => ({
          transcriptChars: result.text?.length || 0,
          audioBytes: result.audio_bytes,
          durationSeconds: result.duration_seconds,
          model: result.model,
        }),
        execute: () => transcribeAudioWithOpenAI(payload, traceId),
      }),
    ]);

    if (darijaAsrOutcome.status === 'rejected') {
      throw darijaAsrOutcome.reason;
    }

    if (openaiAsrOutcome.status === 'rejected') {
      throw openaiAsrOutcome.reason;
    }

    const darijaAsr = darijaAsrOutcome.value;
    const openaiAsr = openaiAsrOutcome.value;

    if (!darijaAsr.text?.trim()) {
      throw httpError(502, 'Darija transcription returned empty text.');
    }

    if (!openaiAsr.text?.trim()) {
      throw httpError(502, 'OpenAI transcription returned empty text.');
    }

    const consolidatedArabicText = await recordProviderOperation({
      traceId,
      jobId: translationJob.id,
      clerkUserId,
      provider: PROVIDERS.OPENAI,
      operation: PROVIDER_OPERATIONS.OPENAI_CONSOLIDATION,
      model: CONSOLIDATION_MODEL,
      inputMetadata: {
        openaiTranscriptChars: openaiAsr.text.length,
        darijaTranscriptChars: darijaAsr.text.length,
      },
      outputMetadata: (result) => ({
        transcriptChars: result.length,
      }),
      execute: () =>
        consolidateArabicTranscript(
          {
            openaiTranscript: openaiAsr.text,
            darijaTranscript: darijaAsr.text,
          },
          traceId,
        ),
    });
    const englishText = await recordProviderOperation({
      traceId,
      jobId: translationJob.id,
      clerkUserId,
      provider: PROVIDERS.OPENAI,
      operation: PROVIDER_OPERATIONS.OPENAI_TRANSLATION,
      model: TRANSLATION_MODEL,
      inputMetadata: {
        consolidatedTranscriptChars: consolidatedArabicText.length,
      },
      outputMetadata: (result) => ({
        translationChars: result.length,
      }),
      execute: () => translateConsolidatedTranscript(consolidatedArabicText, traceId),
    });

    const modelMetadata = {
      models: {
        openaiTranscription: openaiAsr.model,
        darija: darijaAsr.model,
        darijaBase: darijaAsr.base_model,
        consolidation: CONSOLIDATION_MODEL,
        translation: TRANSLATION_MODEL,
      },
      asr: {
        openai: {
          audioBytes: openaiAsr.audio_bytes,
          durationSeconds: openaiAsr.duration_seconds,
        },
        darija: {
          audioBytes: darijaAsr.audio_bytes,
          durationSeconds: darijaAsr.duration_seconds,
        },
      },
    };

    await writeTranslationResult({
      jobId: translationJob.id,
      clerkUserId,
      openaiArabicText: openaiAsr.text,
      darijaArabicText: darijaAsr.text,
      consolidatedArabicText,
      englishText,
      modelMetadata,
    });

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
      model: TRANSLATION_MODEL,
      consolidation_model: CONSOLIDATION_MODEL,
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
