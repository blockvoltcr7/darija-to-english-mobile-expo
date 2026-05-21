import { getSupabaseAdminClient } from './db.mjs';

const ARTIFACT_COLUMNS = [
  'id',
  'job_id',
  'clerk_user_id',
  'kind',
  'status',
  'provider',
  'model',
  'voice',
  'language',
  'format',
  'mime_type',
  'bucket',
  'object_key',
  'byte_size',
  'input_text_hash',
  'input_char_count',
  'duration_seconds',
  'error_code',
  'error_message',
  'started_at',
  'completed_at',
  'created_at',
  'updated_at',
].join(', ');

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
  wrapped.supabase = {
    code: error?.code,
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
    bucket: row.bucket,
    objectKey: row.object_key,
    byteSize: row.byte_size,
    inputTextHash: row.input_text_hash,
    inputCharCount: row.input_char_count,
    durationSeconds:
      row.duration_seconds === null || row.duration_seconds === undefined
        ? null
        : Number(row.duration_seconds),
    errorCode: row.error_code,
    errorMessage: row.error_message,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function applyVoiceFilter(query, voice) {
  const normalizedVoice = normalizeOptionalString(voice);

  return normalizedVoice ? query.eq('voice', normalizedVoice) : query.is('voice', null);
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

async function findTtsArtifactByIdentity(identity) {
  const normalized = buildTtsIdentityFilter(identity);
  let query = getSupabaseAdminClient()
    .from('translation_artifacts')
    .select(ARTIFACT_COLUMNS)
    .eq('job_id', normalized.jobId)
    .eq('clerk_user_id', normalized.clerkUserId)
    .eq('kind', TRANSLATION_ARTIFACT_KIND.ENGLISH_TTS_AUDIO)
    .eq('provider', normalized.provider)
    .eq('model', normalized.model)
    .eq('format', normalized.format)
    .eq('input_text_hash', normalized.inputTextHash)
    .order('created_at', { ascending: false })
    .limit(1);

  query = applyVoiceFilter(query, normalized.voice);

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw createArtifactRepositoryError('find_tts_artifact_by_identity', error);
  }

  return normalizeArtifact(data);
}

export async function findSuccessfulTtsArtifact(identity) {
  const artifact = await findTtsArtifactByIdentity(identity);

  return artifact?.status === TRANSLATION_ARTIFACT_STATUS.SUCCEEDED
    ? artifact
    : null;
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
  const now = new Date().toISOString();
  const identity = buildTtsIdentityFilter({
    jobId,
    clerkUserId,
    provider,
    model,
    voice,
    format,
    inputTextHash,
  });
  const payload = {
    job_id: identity.jobId,
    clerk_user_id: identity.clerkUserId,
    kind: TRANSLATION_ARTIFACT_KIND.ENGLISH_TTS_AUDIO,
    status: TRANSLATION_ARTIFACT_STATUS.RUNNING,
    provider: identity.provider,
    model: identity.model,
    voice: identity.voice,
    language: normalizeRequiredString(language, 'language'),
    format: identity.format,
    mime_type: normalizeRequiredString(mimeType, 'mimeType'),
    bucket: null,
    object_key: null,
    byte_size: null,
    input_text_hash: identity.inputTextHash,
    input_char_count: normalizeRequiredInteger(inputCharCount, 'inputCharCount'),
    duration_seconds: null,
    error_code: null,
    error_message: null,
    started_at: now,
    completed_at: null,
  };

  const { data, error } = await getSupabaseAdminClient()
    .from('translation_artifacts')
    .insert(payload)
    .select(ARTIFACT_COLUMNS)
    .single();

  if (!error) {
    return normalizeArtifact(data);
  }

  if (error.code !== '23505') {
    throw createArtifactRepositoryError('create_tts_artifact_running', error);
  }

  const existing = await findTtsArtifactByIdentity(identity);

  if (!existing) {
    throw createArtifactRepositoryError('lookup_duplicate_tts_artifact', error);
  }

  if (existing.status === TRANSLATION_ARTIFACT_STATUS.SUCCEEDED) {
    return existing;
  }

  const { data: updated, error: updateError } = await getSupabaseAdminClient()
    .from('translation_artifacts')
    .update({
      status: TRANSLATION_ARTIFACT_STATUS.RUNNING,
      mime_type: payload.mime_type,
      error_code: null,
      error_message: null,
      started_at: now,
      completed_at: null,
    })
    .eq('id', existing.id)
    .eq('clerk_user_id', identity.clerkUserId)
    .select(ARTIFACT_COLUMNS)
    .single();

  if (updateError) {
    throw createArtifactRepositoryError('mark_existing_tts_artifact_running', updateError);
  }

  return normalizeArtifact(updated);
}

export async function markTtsArtifactSucceeded({
  artifactId,
  clerkUserId,
  bucket,
  objectKey,
  byteSize,
  durationSeconds,
}) {
  const { data, error } = await getSupabaseAdminClient()
    .from('translation_artifacts')
    .update({
      status: TRANSLATION_ARTIFACT_STATUS.SUCCEEDED,
      bucket: normalizeRequiredString(bucket, 'bucket'),
      object_key: normalizeRequiredString(objectKey, 'objectKey'),
      byte_size: normalizeOptionalInteger(byteSize, 'byteSize'),
      duration_seconds: normalizeOptionalNumber(durationSeconds, 'durationSeconds'),
      error_code: null,
      error_message: null,
      completed_at: new Date().toISOString(),
    })
    .eq('id', normalizeRequiredString(artifactId, 'artifactId'))
    .eq('clerk_user_id', normalizeRequiredString(clerkUserId, 'clerkUserId'))
    .select(ARTIFACT_COLUMNS)
    .single();

  if (error) {
    throw createArtifactRepositoryError('mark_tts_artifact_succeeded', error);
  }

  return normalizeArtifact(data);
}

export async function markTtsArtifactFailed({
  artifactId,
  clerkUserId,
  errorCode,
  errorMessage,
}) {
  const { data, error } = await getSupabaseAdminClient()
    .from('translation_artifacts')
    .update({
      status: TRANSLATION_ARTIFACT_STATUS.FAILED,
      error_code: normalizeSafeErrorCode(errorCode),
      error_message: normalizeSafeErrorMessage(errorMessage),
      completed_at: new Date().toISOString(),
    })
    .eq('id', normalizeRequiredString(artifactId, 'artifactId'))
    .eq('clerk_user_id', normalizeRequiredString(clerkUserId, 'clerkUserId'))
    .select(ARTIFACT_COLUMNS)
    .single();

  if (error) {
    throw createArtifactRepositoryError('mark_tts_artifact_failed', error);
  }

  return normalizeArtifact(data);
}

export async function getEnglishTtsArtifactForUser({ clerkUserId, translationId }) {
  const { data, error } = await getSupabaseAdminClient()
    .from('translation_artifacts')
    .select(ARTIFACT_COLUMNS)
    .eq('job_id', normalizeRequiredString(translationId, 'translationId'))
    .eq('clerk_user_id', normalizeRequiredString(clerkUserId, 'clerkUserId'))
    .eq('kind', TRANSLATION_ARTIFACT_KIND.ENGLISH_TTS_AUDIO)
    .eq('status', TRANSLATION_ARTIFACT_STATUS.SUCCEEDED)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw createArtifactRepositoryError('get_english_tts_artifact_for_user', error);
  }

  return normalizeArtifact(data);
}
