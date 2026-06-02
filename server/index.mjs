import { timingSafeEqual } from 'node:crypto';
import { clerkMiddleware, getAuth } from '@clerk/express';
import { verifyWebhook } from '@clerk/backend/webhooks';
import cors from 'cors';
import express from 'express';
import {
  checkConvexConnection,
  CONVEX_DEPLOYMENT_NAME,
} from './db.mjs';
import { deleteAccountForUser } from './account-deletion.mjs';
import { env } from './env.mjs';
import {
  getOrCreateProfile,
  markClerkWebhookEventProcessed,
  recordClerkWebhookEvent,
  softDeleteProfile,
  upsertProfileFromClerkUser,
} from './profiles.mjs';
import {
  getLatestEnglishTtsArtifactForUser,
  getTtsArtifactForUserByKind,
  TRANSLATION_ARTIFACT_KIND,
} from './artifacts.mjs';
import {
  downloadStoredObject,
  prepareAudioForStorage,
  removeStoredObject,
  uploadOriginalAudioForJob,
} from './storage.mjs';
import { runTranslationProviderPipeline } from './translation-pipeline.mjs';
import {
  createTranslationJob,
  cleanupExpiredEphemeralContent,
  getTranslationForUser,
  listTranslationsForUser,
  markTranslationJobAudioDeleted,
  markTranslationJobFailed,
  markTranslationJobRunning,
  markTranslationJobSavedToHistory,
  markTranslationJobSucceeded,
  updateTranslationJobStorageMetadata,
  updateTranslationJobTriggerRunId,
} from './translations.mjs';
import {
  acceptConsentForUser,
  ephemeralExpiresAt,
  getPrivacyStateForUser,
  isConsentCurrent,
  publicRequiredConsentVersions,
  revokeConsentForUser,
  setPrivacyPreferencesForUser,
} from './privacy.mjs';
import { translateAudioJob } from '../trigger/translate-audio-job.mjs';
import { responseAudioJob } from '../trigger/response-audio-job.mjs';

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
  CONVEX_CONFIGURED,
  RETENTION_CLEANUP_CONFIGURED,
  RETENTION_CLEANUP_SECRET,
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

function requestLogContext(req) {
  const authorization = req.get('Authorization') || '';
  const [scheme] = authorization.split(/\s+/, 1);

  return {
    method: req.method,
    path: req.originalUrl || req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent') || null,
    hasAuthorization: Boolean(authorization),
    authorizationScheme: scheme || null,
  };
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

function modeFromResult(result) {
  const metadata = result?.model_metadata;

  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return null;
  }

  return typeof metadata.mode === 'string' ? metadata.mode : null;
}

function toTranslationListItem(row) {
  const result = firstRelatedRow(row, 'translation_results');

  return {
    id: row.id,
    mode: modeFromResult(result),
    status: row.status,
    saveToHistory: row.save_to_history,
    triggerRunId: row.trigger_run_id,
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

function toTtsArtifactDetail(artifact, translationId, audioPath = 'english-audio') {
  if (!artifact) {
    return null;
  }

  const detail = {
    status: artifact.status,
    provider: artifact.provider,
    model: artifact.model,
    voice: artifact.voice,
    language: artifact.language,
    format: artifact.format,
    mimeType: artifact.mimeType,
    byteSize: artifact.byteSize,
    durationSeconds: artifact.durationSeconds,
    audioUrl: null,
    errorCode: artifact.errorCode,
    errorMessage: artifact.errorMessage,
    createdAt: artifact.createdAt,
    updatedAt: artifact.updatedAt,
  };

  if (artifact.status === 'succeeded') {
    detail.audioUrl = `/v1/translations/${encodeURIComponent(
      translationId,
    )}/artifacts/${audioPath}`;
  }

  return detail;
}

function toTranslationDetail(row, ttsArtifact = null, responseAudioArtifact = null) {
  const result = firstRelatedRow(row, 'translation_results');
  const providerRuns = Array.isArray(row.provider_runs)
    ? [...row.provider_runs].sort((a, b) =>
        String(a.created_at).localeCompare(String(b.created_at)),
      )
    : [];

  return {
    id: row.id,
    status: row.status,
    saveToHistory: row.save_to_history,
    triggerRunId: row.trigger_run_id,
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
    tts: toTtsArtifactDetail(ttsArtifact, row.id),
    responseAudio: toTtsArtifactDetail(
      responseAudioArtifact,
      row.id,
      'arabic-response-audio',
    ),
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

function saveToHistoryFromBody(body) {
  return body?.save_to_history === true;
}

function secureStringEquals(a, b) {
  const left = Buffer.from(String(a ?? ''));
  const right = Buffer.from(String(b ?? ''));

  return left.length === right.length && timingSafeEqual(left, right);
}

function retentionCleanupLimitFromBody(body) {
  const rawLimit = body?.limit;

  if (rawLimit === undefined || rawLimit === null) {
    return 50;
  }

  const parsed = Number.parseInt(String(rawLimit), 10);

  if (Number.isNaN(parsed) || parsed < 1) {
    return 50;
  }

  return Math.min(parsed, 50);
}

function requireRetentionCleanupSecret(req, res, next) {
  if (!RETENTION_CLEANUP_CONFIGURED) {
    return res.status(404).json({ error: 'Not found.' });
  }

  const submittedSecret = req.get('x-retention-cleanup-secret');

  if (!submittedSecret || !secureStringEquals(submittedSecret, RETENTION_CLEANUP_SECRET)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return next();
}

async function deleteOriginalAudioForJob({ traceId, jobId, clerkUserId, storageId }) {
  if (!storageId) {
    return;
  }

  try {
    await removeStoredObject({ storageId });
    await markTranslationJobAudioDeleted({ jobId, clerkUserId });
    logTrace(traceId, 'Original user audio deleted after processing', {
      jobId,
      storageId,
    });
  } catch (cleanupError) {
    logTrace(traceId, 'Original user audio cleanup failed', {
      jobId,
      storageId,
      errorName: cleanupError?.name,
      errorCode: cleanupError?.code || cleanupError?.convex?.code,
    });
  }
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
  const traceId = traceFromRequest(req);

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
    logTrace(traceId, 'Clerk auth rejected request', {
      ...requestLogContext(req),
      hasUserId: Boolean(auth.userId),
      hasSessionId: Boolean(auth.sessionId),
      reason: 'missing_user_id',
    });

    return res.status(401).json({
      error: 'Unauthorized',
      traceId,
      reason: 'clerk_session_missing',
    });
  }

  req.clerkAuth = {
    userId: auth.userId,
    sessionId: auth.sessionId,
    claims: auth.sessionClaims || {},
  };

  next();
}

function claimString(claims, ...keys) {
  for (const key of keys) {
    const value = claims?.[key];

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function displayNameFromClaims(claims) {
  return (
    claimString(claims, 'name', 'full_name') ||
    [claimString(claims, 'first_name'), claimString(claims, 'last_name')]
      .filter(Boolean)
      .join(' ') ||
    null
  );
}

async function requireCurrentConsent(req, res, next) {
  const traceId = traceFromRequest(req);

  try {
    const privacyState = await getPrivacyStateForUser({
      clerkUserId: req.clerkAuth.userId,
    });

    req.privacyState = privacyState;

    if (!isConsentCurrent(privacyState)) {
      logTrace(traceId, 'Consent gate rejected request', {
        userId: req.clerkAuth.userId,
        path: req.originalUrl || req.url,
        reason: 'consent_required',
      });

      return res.status(403).json({
        error: 'AI processing consent is required before using this feature.',
        reason: 'consent_required',
        traceId,
        privacy: privacyState,
      });
    }

    next();
  } catch (error) {
    error.traceId = traceId;
    next(error);
  }
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
      convex: CONVEX_CONFIGURED,
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
    convexConfigured: CONVEX_CONFIGURED,
  });

  res.json(payload);
});

app.get('/health/convex', async (req, res) => {
  const traceId = traceFromRequest(req);
  const result = await checkConvexConnection();
  const payload = {
    ok: result.ok,
    service: 'darija-to-english-api',
    dependency: 'convex',
    deployment: CONVEX_DEPLOYMENT_NAME,
    table: result.table,
    sampledRows: result.sampledRows,
    durationMs: result.durationMs,
    errorName: result.errorName,
  };

  logTrace(traceId, 'Convex smoke check', {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    ok: payload.ok,
    deployment: payload.deployment,
    table: payload.table,
    sampledRows: payload.sampledRows,
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

    const ttsArtifact = await getLatestEnglishTtsArtifactForUser({
      clerkUserId: req.clerkAuth.userId,
      translationId: req.params.id,
    });
    const responseAudioArtifact = await getTtsArtifactForUserByKind({
      clerkUserId: req.clerkAuth.userId,
      translationId: req.params.id,
      kind: TRANSLATION_ARTIFACT_KIND.ARABIC_RESPONSE_TTS_AUDIO,
    });

    logTrace(traceId, 'Translation history detail returned', {
      userId: req.clerkAuth.userId,
      translationId: translation.id,
      status: translation.status,
      triggerRunId: translation.trigger_run_id,
      createdAt: translation.created_at,
      updatedAt: translation.updated_at,
      startedAt: translation.started_at,
      completedAt: translation.completed_at,
      errorCode: translation.error_code,
      providerRunCount: Array.isArray(translation.provider_runs)
        ? translation.provider_runs.length
        : 0,
      ttsStatus: ttsArtifact?.status || null,
      responseAudioStatus: responseAudioArtifact?.status || null,
    });

    res.json(toTranslationDetail(translation, ttsArtifact, responseAudioArtifact));
  } catch (error) {
    error.traceId = traceId;
    next(error);
  }
}

async function handleGetAudioArtifactByKind(req, res, next, { kind, label, mimeFallback }) {
  const traceId = traceFromRequest(req);

  try {
    const artifact = await getTtsArtifactForUserByKind({
      clerkUserId: req.clerkAuth.userId,
      translationId: req.params.id,
      kind,
      onlySucceeded: true,
    });

    if (!artifact?.storageId) {
      return res.status(404).json({ error: 'Audio artifact not found.' });
    }

    const audioBuffer = await downloadStoredObject({
      storageId: artifact.storageId,
    });

    logTrace(traceId, `${label} audio artifact returned`, {
      userId: req.clerkAuth.userId,
      translationId: req.params.id,
      artifactId: artifact.id,
      status: artifact.status,
      mimeType: artifact.mimeType,
      byteSize: audioBuffer.length,
    });

    res
      .status(200)
      .set({
        'Content-Type': artifact.mimeType || mimeFallback,
        'Content-Length': String(audioBuffer.length),
        'Cache-Control': 'private, max-age=300',
      })
      .send(audioBuffer);
  } catch (error) {
    error.traceId = traceId;
    next(error);
  }
}

async function handleGetEnglishAudioArtifact(req, res, next) {
  return handleGetAudioArtifactByKind(req, res, next, {
    kind: TRANSLATION_ARTIFACT_KIND.ENGLISH_TTS_AUDIO,
    label: 'English TTS',
    mimeFallback: 'audio/aac',
  });
}

async function handleGetArabicResponseAudioArtifact(req, res, next) {
  return handleGetAudioArtifactByKind(req, res, next, {
    kind: TRANSLATION_ARTIFACT_KIND.ARABIC_RESPONSE_TTS_AUDIO,
    label: 'Arabic response',
    mimeFallback: 'audio/mpeg',
  });
}

async function handleGetPrivacyState(req, res, next) {
  const traceId = traceFromRequest(req);

  try {
    const privacyState = await getPrivacyStateForUser({
      clerkUserId: req.clerkAuth.userId,
    });

    res.json({
      ...privacyState,
      required_versions: privacyState.required_versions || publicRequiredConsentVersions(),
    });
  } catch (error) {
    error.traceId = traceId;
    next(error);
  }
}

async function handleAcceptConsent(req, res, next) {
  const traceId = traceFromRequest(req);

  try {
    const claims = req.clerkAuth.claims || {};
    const consent = await acceptConsentForUser({
      clerkUserId: req.clerkAuth.userId,
      profileId: req.profile?.id,
      primaryEmail: claimString(claims, 'email', 'primary_email'),
      displayName: displayNameFromClaims(claims),
      source: typeof req.body?.source === 'string' ? req.body.source : undefined,
      platform: typeof req.body?.platform === 'string' ? req.body.platform : undefined,
      appVersion:
        typeof req.body?.app_version === 'string' ? req.body.app_version : undefined,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
    const privacyState = await getPrivacyStateForUser({
      clerkUserId: req.clerkAuth.userId,
    });

    logTrace(traceId, 'Consent accepted', {
      userId: req.clerkAuth.userId,
      consentId: consent?.id,
      source: consent?.source,
    });

    res.status(201).json({
      consent,
      privacy: privacyState,
    });
  } catch (error) {
    error.traceId = traceId;
    next(error);
  }
}

async function handleRevokeConsent(req, res, next) {
  const traceId = traceFromRequest(req);

  try {
    const consent = await revokeConsentForUser({
      clerkUserId: req.clerkAuth.userId,
    });
    const privacyState = await getPrivacyStateForUser({
      clerkUserId: req.clerkAuth.userId,
    });

    logTrace(traceId, 'Consent revoked', {
      userId: req.clerkAuth.userId,
      consentId: consent?.id,
    });

    res.json({ consent, privacy: privacyState });
  } catch (error) {
    error.traceId = traceId;
    next(error);
  }
}

async function handleUpdatePrivacyPreferences(req, res, next) {
  const traceId = traceFromRequest(req);

  try {
    const preferences = await setPrivacyPreferencesForUser({
      clerkUserId: req.clerkAuth.userId,
      saveHistoryByDefault: req.body?.save_history_by_default === true,
    });

    res.json({ preferences });
  } catch (error) {
    error.traceId = traceId;
    next(error);
  }
}

async function handleDeleteAccount(req, res, next) {
  const traceId = traceFromRequest(req);

  try {
    const deletion = await deleteAccountForUser({
      clerkUserId: req.clerkAuth.userId,
    });

    logTrace(traceId, 'Account deletion completed', {
      deletionRequestId: deletion.deletionRequestId,
      appDataDeletion: deletion.appDataDeletion?.summary,
    });

    res.json({
      status: deletion.status,
      deletion_request_id: deletion.deletionRequestId,
      app_data: deletion.appDataDeletion?.summary,
    });
  } catch (error) {
    error.traceId = traceId;
    next(error);
  }
}

async function handleSaveTranslationToHistory(req, res, next) {
  const traceId = traceFromRequest(req);

  try {
    const translation = await getTranslationForUser({
      clerkUserId: req.clerkAuth.userId,
      translationId: req.params.id,
    });

    if (!translation) {
      return res.status(404).json({ error: 'Translation not found.' });
    }

    await markTranslationJobSavedToHistory({
      jobId: req.params.id,
      clerkUserId: req.clerkAuth.userId,
    });

    const savedTranslation = await getTranslationForUser({
      clerkUserId: req.clerkAuth.userId,
      translationId: req.params.id,
    });
    const ttsArtifact = await getLatestEnglishTtsArtifactForUser({
      clerkUserId: req.clerkAuth.userId,
      translationId: req.params.id,
    });
    const responseAudioArtifact = await getTtsArtifactForUserByKind({
      clerkUserId: req.clerkAuth.userId,
      translationId: req.params.id,
      kind: TRANSLATION_ARTIFACT_KIND.ARABIC_RESPONSE_TTS_AUDIO,
    });

    logTrace(traceId, 'Translation saved to history', {
      userId: req.clerkAuth.userId,
      translationId: req.params.id,
      originalAudioDeletedAt: savedTranslation?.audio_deleted_at || null,
    });

    res.json(toTranslationDetail(savedTranslation, ttsArtifact, responseAudioArtifact));
  } catch (error) {
    error.traceId = traceId;
    next(error);
  }
}

async function handleCleanupExpiredEphemeralContent(req, res, next) {
  const traceId = traceFromRequest(req);

  try {
    const before = typeof req.body?.before === 'string' ? req.body.before : new Date();
    const summary = await cleanupExpiredEphemeralContent({
      before,
      limit: retentionCleanupLimitFromBody(req.body),
    });

    logTrace(traceId, 'Expired ephemeral content cleanup completed', summary);
    res.json({ ok: true, summary });
  } catch (error) {
    error.traceId = traceId;
    next(error);
  }
}

app.get('/v1/me/privacy', requireClerkSession, handleGetPrivacyState);
app.post(
  '/v1/admin/retention/cleanup',
  requireRetentionCleanupSecret,
  handleCleanupExpiredEphemeralContent,
);
app.post(
  '/v1/me/consent',
  requireClerkSession,
  ensureProfileForRequest,
  handleAcceptConsent,
);
app.post('/v1/me/consent/revoke', requireClerkSession, handleRevokeConsent);
app.delete('/v1/account', requireClerkSession, handleDeleteAccount);
app.delete('/v1/me', requireClerkSession, handleDeleteAccount);
app.post(
  '/v1/me/privacy-preferences',
  requireClerkSession,
  requireCurrentConsent,
  handleUpdatePrivacyPreferences,
);

app.get(
  '/v1/translations',
  requireClerkSession,
  requireCurrentConsent,
  handleListTranslations,
);
app.get(
  '/v1/translations/:id/artifacts/english-audio',
  requireClerkSession,
  requireCurrentConsent,
  handleGetEnglishAudioArtifact,
);
app.get(
  '/v1/translations/:id/artifacts/arabic-response-audio',
  requireClerkSession,
  requireCurrentConsent,
  handleGetArabicResponseAudioArtifact,
);
app.post(
  '/v1/translations/:id/save',
  requireClerkSession,
  requireCurrentConsent,
  handleSaveTranslationToHistory,
);
app.get(
  '/v1/translations/:id',
  requireClerkSession,
  requireCurrentConsent,
  handleGetTranslation,
);

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

async function dispatchResponseAudioJob({ jobId }) {
  return responseAudioJob.trigger(
    { job_id: jobId },
    {
      idempotencyKey: `response-audio-job:${jobId}`,
      tags: ['darija-mobile', 'response-audio', `job:${jobId}`],
    },
  );
}

async function handleCreateResponseAudio(req, res, next) {
  const traceId = traceFromRequest(req);
  const startedAt = Date.now();
  let translationJob = null;
  let storedAudio = null;

  try {
    requireTriggerRuntime();

    const payload = validatePayload(req.body);
    const saveToHistory = saveToHistoryFromBody(req.body);
    const audio = prepareAudioForStorage(payload);
    const audioBytes = audio.sizeBytes;
    const clerkUserId = req.clerkAuth.userId;

    logTrace(traceId, 'Response audio request received', {
      ip: req.ip,
      userId: clerkUserId,
      filename: audio.filename,
      base64Chars: audio.audioBase64.length,
      audioBytes,
      audioMimeType: audio.mimeType,
      saveToHistory,
      contentLength: req.get('Content-Length'),
    });

    translationJob = await createTranslationJob({
      clerkUserId,
      profileId: req.profile?.id,
      filename: audio.filename,
      audioBytes,
      traceId,
      saveToHistory,
      ephemeralExpiresAt: ephemeralExpiresAt(),
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
        audioStorageId: storedAudio.storageId,
        audioSizeBytes: storedAudio.sizeBytes,
        audioMimeType: storedAudio.mimeType,
        audioRetentionExpiresAt: storedAudio.retentionExpiresAt,
      });
    } catch (metadataError) {
      try {
        await removeStoredObject({
          storageId: storedAudio.storageId,
        });
        storedAudio = null;
      } catch (cleanupError) {
        logTrace(traceId, 'Audio cleanup after response metadata failure failed', {
          jobId: translationJob.id,
          storageId: storedAudio.storageId,
          errorName: cleanupError?.name,
          errorCode: cleanupError?.code,
        });
      }

      throw metadataError;
    }

    const triggerHandle = await dispatchResponseAudioJob({
      jobId: translationJob.id,
    });
    const triggerRunId = triggerRunIdFromHandle(triggerHandle);

    if (!triggerRunId) {
      throw httpError(502, 'Trigger.dev response audio dispatch did not return a run ID.');
    }

    await updateTranslationJobTriggerRunId({
      jobId: translationJob.id,
      clerkUserId,
      triggerRunId,
    });

    const responsePayload = {
      jobId: translationJob.id,
      responseAudioJobId: translationJob.id,
      status: 'queued',
      triggerRunId,
      createdAt: translationJob.created_at,
      detailUrl: `/v1/response-audio/${translationJob.id}`,
      saveToHistory,
    };

    logTrace(traceId, 'Response audio queued', {
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
          errorCode: safeErrorCode(error, 'response_audio_dispatch_failed'),
          errorMessage: safeErrorMessage(error),
        });
      } catch (recordError) {
        logTrace(traceId, 'Response audio job failure recording failed', {
          jobId: translationJob.id,
          errorName: recordError?.name,
          errorCode: recordError?.convex?.code,
        });
      }
    }

    next(error);
  }
}

app.post(
  '/v1/response-audio',
  requireClerkSession,
  ensureProfileForRequest,
  requireCurrentConsent,
  handleCreateResponseAudio,
);

app.get(
  '/v1/response-audio/:id',
  requireClerkSession,
  requireCurrentConsent,
  handleGetTranslation,
);

async function handleCreateTranslation(req, res, next) {
  const traceId = traceFromRequest(req);
  const startedAt = Date.now();
  let translationJob = null;
  let storedAudio = null;

  try {
    requireTriggerRuntime();

    const payload = validatePayload(req.body);
    const saveToHistory = saveToHistoryFromBody(req.body);
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
      saveToHistory,
      contentLength: req.get('Content-Length'),
    });

    translationJob = await createTranslationJob({
      clerkUserId,
      profileId: req.profile?.id,
      filename: audio.filename,
      audioBytes,
      traceId,
      saveToHistory,
      ephemeralExpiresAt: ephemeralExpiresAt(),
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
        audioStorageId: storedAudio.storageId,
        audioSizeBytes: storedAudio.sizeBytes,
        audioMimeType: storedAudio.mimeType,
        audioRetentionExpiresAt: storedAudio.retentionExpiresAt,
      });
    } catch (metadataError) {
      try {
        await removeStoredObject({
          storageId: storedAudio.storageId,
        });
        storedAudio = null;
      } catch (cleanupError) {
        logTrace(traceId, 'Audio cleanup after async metadata failure failed', {
          jobId: translationJob.id,
          storageId: storedAudio.storageId,
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
      saveToHistory,
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
          errorCode: recordError?.convex?.code,
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
  requireCurrentConsent,
  handleCreateTranslation,
);

async function handleTranslateAudio(req, res, next) {
  const traceId = traceFromRequest(req);
  const startedAt = Date.now();
  let translationJob = null;
  let storedAudio = null;

  try {
    const payload = validatePayload(req.body);
    const saveToHistory = saveToHistoryFromBody(req.body);
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
      saveToHistory,
      contentLength: req.get('Content-Length'),
    });

    translationJob = await createTranslationJob({
      clerkUserId,
      profileId: req.profile?.id,
      filename: audio.filename,
      audioBytes,
      traceId,
      saveToHistory,
      ephemeralExpiresAt: ephemeralExpiresAt(),
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
        audioStorageId: storedAudio.storageId,
        audioSizeBytes: storedAudio.sizeBytes,
        audioMimeType: storedAudio.mimeType,
        audioRetentionExpiresAt: storedAudio.retentionExpiresAt,
      });
    } catch (metadataError) {
      try {
        await removeStoredObject({
          storageId: storedAudio.storageId,
        });
        storedAudio = null;
      } catch (cleanupError) {
        logTrace(traceId, 'Audio cleanup after metadata failure failed', {
          jobId: translationJob.id,
          storageId: storedAudio.storageId,
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
        audioStorageId: storedAudio.storageId,
        audioMimeType: storedAudio.mimeType,
      },
      logTrace,
    });

    await deleteOriginalAudioForJob({
      traceId,
      jobId: translationJob.id,
      clerkUserId,
      storageId: storedAudio?.storageId,
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
      saveToHistory,
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
          errorCode: recordError?.convex?.code,
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
  requireCurrentConsent,
  handleTranslateAudio,
);
app.post(
  '/translate-audio',
  requireClerkSession,
  ensureProfileForRequest,
  requireCurrentConsent,
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

  res.status(status).json({
    error: message,
    ...(error.reason || error.code ? { reason: error.reason || error.code } : {}),
    ...(error.traceId ? { traceId: error.traceId } : {}),
  });
});

app.listen(PORT, HOST, () => {
  logTrace('startup', 'Darija to English API listening', {
    url: `http://${HOST}:${PORT}`,
    bodyLimit: BODY_LIMIT,
    darijaConfigured: Boolean(ASR_BASE_URL && ASR_API_KEY),
    darijaEndpoint: ASR_TRANSCRIBE_URL || null,
    openaiConfigured: Boolean(OPENAI_API_KEY),
    convexConfigured: CONVEX_CONFIGURED,
    models: {
      openai_transcription: OPENAI_TRANSCRIPTION_MODEL,
      consolidation: CONSOLIDATION_MODEL,
      translation: TRANSLATION_MODEL,
    },
  });
});
