import { randomUUID } from 'node:crypto';
import { callConvexFunction } from './db.mjs';

export const TRANSLATION_ARTIFACT_KIND = Object.freeze({
  ENGLISH_TTS_AUDIO: 'english_tts_audio',
});

export const TRANSLATION_ARTIFACT_STATUS = Object.freeze({
  QUEUED: 'queued',
  RUNNING: 'running',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  CANCELED: 'canceled',
});

export const TRANSLATION_ARTIFACT_PROVIDERS = Object.freeze({
  OPENAI: 'openai',
});

const SAFE_ERROR_CODE_MAX_LENGTH = 80;
const SAFE_ERROR_MESSAGE_MAX_LENGTH = 500;

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

function normalizeRequiredInteger(value, fieldName) {
  if (!Number.isInteger(value) || value < 0) {
    throw new TypeError(`${fieldName} must be a non-negative integer.`);
  }

  return value;
}

function normalizeOptionalNumber(value, fieldName) {
  if (value === undefined || value === null) {
    return null;
  }

  if (!Number.isFinite(value) || value < 0) {
    throw new TypeError(`${fieldName} must be a non-negative number.`);
  }

  return value;
}

function normalizeSafeErrorCode(value) {
  const normalized = normalizeOptionalString(value);

  return normalized?.slice(0, SAFE_ERROR_CODE_MAX_LENGTH) || null;
}

function normalizeSafeErrorMessage(value) {
  const normalized = normalizeOptionalString(value);

  return normalized?.slice(0, SAFE_ERROR_MESSAGE_MAX_LENGTH) || null;
}

function createArtifactRepositoryError(operation, error) {
  const wrapped = new Error(`Artifact repository operation failed: ${operation}.`);

  wrapped.name = 'ArtifactRepositoryError';
  wrapped.status = error?.status || 500;
  wrapped.operation = operation;
  wrapped.convex = {
    code: error?.data?.code || error?.code,
    name: error?.name,
    status: error?.status,
  };

  return wrapped;
}

function normalizeArtifact(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    jobId: row.job_id,
    clerkUserId: row.clerk_user_id,
    kind: row.kind,
    status: row.status,
    provider: row.provider,
    model: row.model,
    voice: row.voice,
    language: row.language,
    format: row.format,
    mimeType: row.mime_type,
    storageId: row.storage_id,
    byteSize: row.byte_size,
    inputTextHash: row.input_text_hash,
    inputCharCount: row.input_char_count,
    durationSeconds: row.duration_seconds,
    errorCode: row.error_code,
    errorMessage: row.error_message,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function callArtifactFunction(operation, functionName, args) {
  try {
    return normalizeArtifact(await callConvexFunction(functionName, args));
  } catch (error) {
    throw createArtifactRepositoryError(operation, error);
  }
}

function buildTtsIdentityFilter({
  jobId,
  clerkUserId,
  provider,
  model,
  voice,
  format,
  inputTextHash,
}) {
  return {
    jobId: normalizeRequiredString(jobId, 'jobId'),
    clerkUserId: normalizeRequiredString(clerkUserId, 'clerkUserId'),
    provider: normalizeRequiredString(provider, 'provider'),
    model: normalizeRequiredString(model, 'model'),
    voice: normalizeOptionalString(voice),
    format: normalizeRequiredString(format, 'format'),
    inputTextHash: normalizeRequiredString(inputTextHash, 'inputTextHash'),
  };
}

export async function findSuccessfulTtsArtifact(identity) {
  return callArtifactFunction(
    'find_successful_tts_artifact',
    'artifacts:findSuccessfulTtsArtifact',
    buildTtsIdentityFilter(identity),
  );
}

export async function createOrMarkTtsArtifactRunning({
  jobId,
  clerkUserId,
  provider,
  model,
  voice,
  language,
  format,
  mimeType,
  inputTextHash,
  inputCharCount,
}) {
  const identity = buildTtsIdentityFilter({
    jobId,
    clerkUserId,
    provider,
    model,
    voice,
    format,
    inputTextHash,
  });

  return callArtifactFunction(
    'create_tts_artifact_running',
    'artifacts:createOrMarkTtsArtifactRunning',
    {
      artifactId: randomUUID(),
      ...identity,
      provider: TRANSLATION_ARTIFACT_PROVIDERS.OPENAI,
      language: normalizeRequiredString(language, 'language'),
      mimeType: normalizeRequiredString(mimeType, 'mimeType'),
      inputCharCount: normalizeRequiredInteger(inputCharCount, 'inputCharCount'),
    },
  );
}

export async function markTtsArtifactSucceeded({
  artifactId,
  clerkUserId,
  storageId,
  byteSize,
  durationSeconds,
}) {
  return callArtifactFunction(
    'mark_tts_artifact_succeeded',
    'artifacts:markTtsArtifactSucceeded',
    {
      artifactId: normalizeRequiredString(artifactId, 'artifactId'),
      clerkUserId: normalizeRequiredString(clerkUserId, 'clerkUserId'),
      storageId: normalizeRequiredString(storageId, 'storageId'),
      byteSize: normalizeOptionalInteger(byteSize, 'byteSize'),
      durationSeconds: normalizeOptionalNumber(durationSeconds, 'durationSeconds'),
    },
  );
}

export async function markTtsArtifactFailed({
  artifactId,
  clerkUserId,
  errorCode,
  errorMessage,
}) {
  return callArtifactFunction('mark_tts_artifact_failed', 'artifacts:markTtsArtifactFailed', {
    artifactId: normalizeRequiredString(artifactId, 'artifactId'),
    clerkUserId: normalizeRequiredString(clerkUserId, 'clerkUserId'),
    errorCode: normalizeSafeErrorCode(errorCode),
    errorMessage: normalizeSafeErrorMessage(errorMessage),
  });
}

export async function getEnglishTtsArtifactForUser({ clerkUserId, translationId }) {
  return callArtifactFunction(
    'get_english_tts_artifact_for_user',
    'artifacts:getEnglishTtsArtifactForUser',
    {
      clerkUserId: normalizeRequiredString(clerkUserId, 'clerkUserId'),
      translationId: normalizeRequiredString(translationId, 'translationId'),
    },
  );
}

export async function getLatestEnglishTtsArtifactForUser({
  clerkUserId,
  translationId,
}) {
  return callArtifactFunction(
    'get_latest_english_tts_artifact_for_user',
    'artifacts:getLatestEnglishTtsArtifactForUser',
    {
      clerkUserId: normalizeRequiredString(clerkUserId, 'clerkUserId'),
      translationId: normalizeRequiredString(translationId, 'translationId'),
    },
  );
}
