import { randomUUID } from 'node:crypto';
import { callConvexFunction } from './db.mjs';
import { requiredConsentVersions } from './privacy.mjs';

const DEFAULT_HISTORY_LIMIT = 20;
const MAX_HISTORY_LIMIT = 50;

export const TRANSLATION_JOB_STATUS = Object.freeze({
  QUEUED: 'queued',
  RUNNING: 'running',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  CANCELED: 'canceled',
});

export const PROVIDER_RUN_STATUS = Object.freeze({
  RUNNING: 'running',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  CANCELED: 'canceled',
});

export const PROVIDER_OPERATIONS = Object.freeze({
  OPENAI_TRANSCRIPTION: 'openai_transcription',
  MODAL_DARIJA_ASR: 'modal_darija_asr',
  OPENAI_CONSOLIDATION: 'openai_consolidation',
  OPENAI_TRANSLATION: 'openai_translation',
  OPENAI_TTS: 'openai_tts',
});

export const PROVIDERS = Object.freeze({
  OPENAI: 'openai',
  MODAL: 'modal',
});

const SENSITIVE_KEY_PATTERN =
  /audio[_-]?base64|authorization|bearer|cookie|password|secret|stack|token|api[_-]?key/i;

function normalizeRequiredString(value, fieldName) {
  if (typeof value !== 'string') {
    throw new TypeError(`${fieldName} must be a non-empty string.`);
  }

  const normalized = value.trim();

  if (!normalized) {
    throw new TypeError(`${fieldName} must be a non-empty string.`);
  }

  return normalized;
}

function normalizeOptionalString(value) {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();

  return normalized || null;
}

function normalizeOptionalInteger(value, fieldName) {
  if (value === undefined || value === null) {
    return null;
  }

  if (!Number.isInteger(value) || value < 0) {
    throw new TypeError(`${fieldName} must be a non-negative integer.`);
  }

  return value;
}

function normalizeOptionalTimestamp(value, fieldName) {
  if (value === undefined || value === null) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'string' && value.trim()) {
    const timestamp = new Date(value);

    if (!Number.isNaN(timestamp.valueOf())) {
      return timestamp.toISOString();
    }
  }

  throw new TypeError(`${fieldName} must be a valid timestamp.`);
}

function normalizeHistoryLimit(value) {
  const parsed = Number.parseInt(String(value ?? DEFAULT_HISTORY_LIMIT), 10);

  if (Number.isNaN(parsed) || parsed < 1) {
    return DEFAULT_HISTORY_LIMIT;
  }

  return Math.min(parsed, MAX_HISTORY_LIMIT);
}

function normalizeCleanupLimit(value) {
  if (value === undefined || value === null) {
    return 50;
  }

  const parsed = Number.parseInt(String(value), 10);

  if (Number.isNaN(parsed) || parsed < 1) {
    return 50;
  }

  return Math.min(parsed, 50);
}

function normalizeCursor(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  return normalizeOptionalTimestamp(value, 'cursor');
}

function sanitizeMetadata(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return sanitizeObject(value);
}

function sanitizeObject(value) {
  const sanitized = {};

  for (const [key, item] of Object.entries(value)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      continue;
    }

    const sanitizedValue = sanitizeJsonValue(item);

    if (sanitizedValue !== undefined) {
      sanitized[key] = sanitizedValue;
    }
  }

  return sanitized;
}

function sanitizeJsonValue(value) {
  if (value === null) {
    return null;
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => sanitizeJsonValue(item))
      .filter((item) => item !== undefined);
  }

  if (value && typeof value === 'object') {
    return sanitizeObject(value);
  }

  return undefined;
}

function createTranslationRepositoryError(operation, error) {
  const wrapped = new Error(`Translation repository operation failed: ${operation}.`);
  const convexCode = error?.data?.code || error?.code;
  const errorMessage = String(error?.message || '');

  wrapped.name = 'TranslationRepositoryError';
  wrapped.status =
    convexCode === 'consent_required' || errorMessage.includes('consent_required')
      ? 403
      : error?.status || 500;
  wrapped.code =
    convexCode ||
    (errorMessage.includes('consent_required') ? 'consent_required' : undefined);
  wrapped.reason = wrapped.code;
  wrapped.operation = operation;
  wrapped.convex = {
    code: wrapped.code,
    name: error?.name,
    status: error?.status,
  };

  return wrapped;
}

function requireKnownValue(value, allowedValues, fieldName) {
  const normalized = normalizeRequiredString(value, fieldName);

  if (!Object.values(allowedValues).includes(normalized)) {
    throw new TypeError(`${fieldName} has an unsupported value.`);
  }

  return normalized;
}

async function callTranslationFunction(operation, functionName, args) {
  try {
    return await callConvexFunction(functionName, args);
  } catch (error) {
    throw createTranslationRepositoryError(operation, error);
  }
}

export async function createTranslationJob({
  clerkUserId,
  profileId,
  filename,
  audioBytes,
  traceId,
  saveToHistory = false,
  ephemeralExpiresAt,
}) {
  return callTranslationFunction('create_translation_job', 'translations:createTranslationJob', {
    jobId: randomUUID(),
    clerkUserId: normalizeRequiredString(clerkUserId, 'clerkUserId'),
    profileId: normalizeOptionalString(profileId),
    filename: normalizeOptionalString(filename),
    audioBytes: normalizeOptionalInteger(audioBytes, 'audioBytes'),
    traceId: normalizeOptionalString(traceId),
    saveToHistory: Boolean(saveToHistory),
    ephemeralExpiresAt: saveToHistory
      ? null
      : normalizeOptionalTimestamp(ephemeralExpiresAt, 'ephemeralExpiresAt'),
    ...requiredConsentVersions(),
  });
}

export async function updateTranslationJobStorageMetadata({
  jobId,
  clerkUserId,
  audioStorageId,
  audioSizeBytes,
  audioMimeType,
  audioRetentionExpiresAt,
}) {
  return callTranslationFunction(
    'update_translation_job_storage_metadata',
    'translations:updateStorageMetadata',
    {
      jobId: normalizeRequiredString(jobId, 'jobId'),
      clerkUserId: normalizeRequiredString(clerkUserId, 'clerkUserId'),
      audioStorageId: normalizeOptionalString(audioStorageId),
      audioSizeBytes: normalizeOptionalInteger(audioSizeBytes, 'audioSizeBytes'),
      audioMimeType: normalizeOptionalString(audioMimeType),
      audioRetentionExpiresAt: normalizeOptionalTimestamp(
        audioRetentionExpiresAt,
        'audioRetentionExpiresAt',
      ),
    },
  );
}

export async function markTranslationJobAudioDeleted({
  jobId,
  clerkUserId,
  deletedAt = new Date(),
}) {
  return callTranslationFunction(
    'mark_translation_job_audio_deleted',
    'translations:markAudioDeleted',
    {
      jobId: normalizeRequiredString(jobId, 'jobId'),
      clerkUserId: normalizeRequiredString(clerkUserId, 'clerkUserId'),
      deletedAt: normalizeOptionalTimestamp(deletedAt, 'deletedAt'),
    },
  );
}

export async function markTranslationJobSavedToHistory({ jobId, clerkUserId }) {
  return callTranslationFunction(
    'mark_translation_job_saved_to_history',
    'translations:markSavedToHistory',
    {
      jobId: normalizeRequiredString(jobId, 'jobId'),
      clerkUserId: normalizeRequiredString(clerkUserId, 'clerkUserId'),
    },
  );
}

export async function cleanupExpiredEphemeralContent({
  before = new Date(),
  limit = 50,
} = {}) {
  return callTranslationFunction(
    'cleanup_expired_ephemeral_content',
    'translations:cleanupExpiredEphemeralContent',
    {
      before: normalizeOptionalTimestamp(before, 'before'),
      limit: normalizeCleanupLimit(limit),
    },
  );
}

export async function updateTranslationJobTriggerRunId({
  jobId,
  clerkUserId,
  triggerRunId,
}) {
  return callTranslationFunction(
    'update_translation_job_trigger_run_id',
    'translations:updateTriggerRunId',
    {
      jobId: normalizeRequiredString(jobId, 'jobId'),
      clerkUserId: normalizeRequiredString(clerkUserId, 'clerkUserId'),
      triggerRunId: normalizeOptionalString(triggerRunId),
    },
  );
}

export async function markTranslationJobRunning({ jobId, clerkUserId }) {
  return callTranslationFunction('mark_translation_job_running', 'translations:markRunning', {
    jobId: normalizeRequiredString(jobId, 'jobId'),
    clerkUserId: normalizeRequiredString(clerkUserId, 'clerkUserId'),
  });
}

export async function getTranslationJobById({ jobId }) {
  return callTranslationFunction('get_translation_job_by_id', 'translations:getById', {
    jobId: normalizeRequiredString(jobId, 'jobId'),
  });
}

export async function claimTranslationJobForProcessing({ jobId }) {
  return callTranslationFunction(
    'claim_translation_job_for_processing',
    'translations:claimForProcessing',
    {
      jobId: normalizeRequiredString(jobId, 'jobId'),
    },
  );
}

export async function markTranslationJobSucceeded({ jobId, clerkUserId }) {
  return callTranslationFunction('mark_translation_job_succeeded', 'translations:markSucceeded', {
    jobId: normalizeRequiredString(jobId, 'jobId'),
    clerkUserId: normalizeRequiredString(clerkUserId, 'clerkUserId'),
  });
}

export async function markTranslationJobFailed({
  jobId,
  clerkUserId,
  errorCode,
  errorMessage,
}) {
  return callTranslationFunction('mark_translation_job_failed', 'translations:markFailed', {
    jobId: normalizeRequiredString(jobId, 'jobId'),
    clerkUserId: normalizeRequiredString(clerkUserId, 'clerkUserId'),
    errorCode: normalizeOptionalString(errorCode),
    errorMessage: normalizeOptionalString(errorMessage),
  });
}

export async function recordProviderRun({
  jobId,
  clerkUserId,
  provider,
  operation,
  model,
  status,
  latencyMs,
  inputMetadata,
  outputMetadata,
  errorCode,
  errorMessage,
  startedAt,
  completedAt,
}) {
  return callTranslationFunction('record_provider_run', 'translations:recordProviderRun', {
    runId: randomUUID(),
    jobId: normalizeRequiredString(jobId, 'jobId'),
    clerkUserId: normalizeRequiredString(clerkUserId, 'clerkUserId'),
    provider: requireKnownValue(provider, PROVIDERS, 'provider'),
    operation: requireKnownValue(operation, PROVIDER_OPERATIONS, 'operation'),
    model: normalizeOptionalString(model),
    status: requireKnownValue(status, PROVIDER_RUN_STATUS, 'status'),
    latencyMs: normalizeOptionalInteger(latencyMs, 'latencyMs'),
    inputMetadata: sanitizeMetadata(inputMetadata),
    outputMetadata: sanitizeMetadata(outputMetadata),
    errorCode: normalizeOptionalString(errorCode),
    errorMessage: normalizeOptionalString(errorMessage),
    startedAt: normalizeOptionalTimestamp(startedAt, 'startedAt'),
    completedAt: normalizeOptionalTimestamp(completedAt, 'completedAt'),
  });
}

export async function writeTranslationResult({
  jobId,
  clerkUserId,
  openaiArabicText,
  darijaArabicText,
  consolidatedArabicText,
  englishText,
  modelMetadata,
}) {
  return callTranslationFunction('write_translation_result', 'translations:writeResult', {
    resultId: randomUUID(),
    jobId: normalizeRequiredString(jobId, 'jobId'),
    clerkUserId: normalizeRequiredString(clerkUserId, 'clerkUserId'),
    openaiArabicText: normalizeOptionalString(openaiArabicText),
    darijaArabicText: normalizeOptionalString(darijaArabicText),
    consolidatedArabicText: normalizeRequiredString(
      consolidatedArabicText,
      'consolidatedArabicText',
    ),
    englishText: normalizeRequiredString(englishText, 'englishText'),
    modelMetadata: sanitizeMetadata(modelMetadata),
  });
}

export async function listTranslationsForUser({
  clerkUserId,
  limit,
  cursor,
}) {
  return callTranslationFunction('list_translations_for_user', 'translations:listForUser', {
    clerkUserId: normalizeRequiredString(clerkUserId, 'clerkUserId'),
    limit: normalizeHistoryLimit(limit),
    cursor: normalizeCursor(cursor),
  });
}

export async function getTranslationForUser({ clerkUserId, translationId }) {
  return callTranslationFunction('get_translation_for_user', 'translations:getForUser', {
    clerkUserId: normalizeRequiredString(clerkUserId, 'clerkUserId'),
    translationId: normalizeRequiredString(translationId, 'translationId'),
  });
}
