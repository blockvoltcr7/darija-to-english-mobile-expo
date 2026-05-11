import { getSupabaseAdminClient } from './db.mjs';

const JOB_COLUMNS = [
  'id',
  'clerk_user_id',
  'profile_id',
  'status',
  'source_filename',
  'source_audio_bytes',
  'audio_bucket',
  'audio_object_key',
  'audio_size_bytes',
  'audio_mime_type',
  'audio_retention_expires_at',
  'audio_deleted_at',
  'artifact_bucket',
  'artifact_prefix',
  'artifacts_deleted_at',
  'trigger_run_id',
  'trace_id',
  'error_code',
  'error_message',
  'started_at',
  'completed_at',
  'created_at',
  'updated_at',
  'deleted_at',
].join(', ');

const RESULT_COLUMNS = [
  'id',
  'job_id',
  'clerk_user_id',
  'openai_arabic_text',
  'darija_arabic_text',
  'consolidated_arabic_text',
  'english_text',
  'model_metadata',
  'created_at',
  'updated_at',
].join(', ');

const PROVIDER_RUN_COLUMNS = [
  'id',
  'job_id',
  'clerk_user_id',
  'provider',
  'operation',
  'model',
  'status',
  'latency_ms',
  'input_metadata',
  'output_metadata',
  'error_code',
  'error_message',
  'started_at',
  'completed_at',
  'created_at',
].join(', ');

const TRANSLATION_WITH_RESULT_COLUMNS = `
  ${JOB_COLUMNS},
  translation_results (${RESULT_COLUMNS})
`;

const TRANSLATION_DETAIL_COLUMNS = `
  ${JOB_COLUMNS},
  translation_results (${RESULT_COLUMNS}),
  provider_runs (${PROVIDER_RUN_COLUMNS})
`;

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

  wrapped.name = 'TranslationRepositoryError';
  wrapped.status = error?.status || 500;
  wrapped.operation = operation;
  wrapped.supabase = {
    code: error?.code,
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

async function updateTranslationJob({
  jobId,
  clerkUserId,
  payload,
  operation,
}) {
  const { data, error } = await getSupabaseAdminClient()
    .from('translation_jobs')
    .update(payload)
    .eq('id', normalizeRequiredString(jobId, 'jobId'))
    .eq('clerk_user_id', normalizeRequiredString(clerkUserId, 'clerkUserId'))
    .select(JOB_COLUMNS)
    .single();

  if (error) {
    throw createTranslationRepositoryError(operation, error);
  }

  return data;
}

export async function createTranslationJob({
  clerkUserId,
  profileId,
  filename,
  audioBytes,
  traceId,
}) {
  const payload = {
    clerk_user_id: normalizeRequiredString(clerkUserId, 'clerkUserId'),
    profile_id: normalizeOptionalString(profileId),
    status: TRANSLATION_JOB_STATUS.QUEUED,
    source_filename: normalizeOptionalString(filename),
    source_audio_bytes: normalizeOptionalInteger(audioBytes, 'audioBytes'),
    trace_id: normalizeOptionalString(traceId),
  };

  const { data, error } = await getSupabaseAdminClient()
    .from('translation_jobs')
    .insert(payload)
    .select(JOB_COLUMNS)
    .single();

  if (error) {
    throw createTranslationRepositoryError('create_translation_job', error);
  }

  return data;
}

export async function updateTranslationJobStorageMetadata({
  jobId,
  clerkUserId,
  audioBucket,
  audioObjectKey,
  audioSizeBytes,
  audioMimeType,
  audioRetentionExpiresAt,
  artifactBucket,
  artifactPrefix,
}) {
  return updateTranslationJob({
    jobId,
    clerkUserId,
    payload: {
      audio_bucket: normalizeOptionalString(audioBucket),
      audio_object_key: normalizeOptionalString(audioObjectKey),
      audio_size_bytes: normalizeOptionalInteger(audioSizeBytes, 'audioSizeBytes'),
      audio_mime_type: normalizeOptionalString(audioMimeType),
      audio_retention_expires_at: normalizeOptionalTimestamp(
        audioRetentionExpiresAt,
        'audioRetentionExpiresAt',
      ),
      artifact_bucket: normalizeOptionalString(artifactBucket),
      artifact_prefix: normalizeOptionalString(artifactPrefix),
    },
    operation: 'update_translation_job_storage_metadata',
  });
}

export async function markTranslationJobAudioDeleted({
  jobId,
  clerkUserId,
  deletedAt = new Date(),
}) {
  return updateTranslationJob({
    jobId,
    clerkUserId,
    payload: {
      audio_deleted_at: normalizeOptionalTimestamp(deletedAt, 'deletedAt'),
    },
    operation: 'mark_translation_job_audio_deleted',
  });
}

export async function updateTranslationJobTriggerRunId({
  jobId,
  clerkUserId,
  triggerRunId,
}) {
  return updateTranslationJob({
    jobId,
    clerkUserId,
    payload: {
      trigger_run_id: normalizeOptionalString(triggerRunId),
    },
    operation: 'update_translation_job_trigger_run_id',
  });
}

export async function markTranslationJobRunning({ jobId, clerkUserId }) {
  return updateTranslationJob({
    jobId,
    clerkUserId,
    payload: {
      status: TRANSLATION_JOB_STATUS.RUNNING,
      started_at: new Date().toISOString(),
      error_code: null,
      error_message: null,
    },
    operation: 'mark_translation_job_running',
  });
}

export async function getTranslationJobById({ jobId }) {
  const { data, error } = await getSupabaseAdminClient()
    .from('translation_jobs')
    .select(JOB_COLUMNS)
    .eq('id', normalizeRequiredString(jobId, 'jobId'))
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    throw createTranslationRepositoryError('get_translation_job_by_id', error);
  }

  return data;
}

export async function claimTranslationJobForProcessing({ jobId }) {
  const { data, error } = await getSupabaseAdminClient()
    .from('translation_jobs')
    .update({
      status: TRANSLATION_JOB_STATUS.RUNNING,
      started_at: new Date().toISOString(),
      error_code: null,
      error_message: null,
    })
    .eq('id', normalizeRequiredString(jobId, 'jobId'))
    .eq('status', TRANSLATION_JOB_STATUS.QUEUED)
    .is('deleted_at', null)
    .select(JOB_COLUMNS)
    .maybeSingle();

  if (error) {
    throw createTranslationRepositoryError('claim_translation_job_for_processing', error);
  }

  if (data) {
    return {
      claimed: true,
      job: data,
    };
  }

  return {
    claimed: false,
    job: await getTranslationJobById({ jobId }),
  };
}

export async function markTranslationJobSucceeded({ jobId, clerkUserId }) {
  return updateTranslationJob({
    jobId,
    clerkUserId,
    payload: {
      status: TRANSLATION_JOB_STATUS.SUCCEEDED,
      completed_at: new Date().toISOString(),
      error_code: null,
      error_message: null,
    },
    operation: 'mark_translation_job_succeeded',
  });
}

export async function markTranslationJobFailed({
  jobId,
  clerkUserId,
  errorCode,
  errorMessage,
}) {
  return updateTranslationJob({
    jobId,
    clerkUserId,
    payload: {
      status: TRANSLATION_JOB_STATUS.FAILED,
      completed_at: new Date().toISOString(),
      error_code: normalizeOptionalString(errorCode),
      error_message: normalizeOptionalString(errorMessage),
    },
    operation: 'mark_translation_job_failed',
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
  const payload = {
    job_id: normalizeRequiredString(jobId, 'jobId'),
    clerk_user_id: normalizeRequiredString(clerkUserId, 'clerkUserId'),
    provider: requireKnownValue(provider, PROVIDERS, 'provider'),
    operation: requireKnownValue(operation, PROVIDER_OPERATIONS, 'operation'),
    model: normalizeOptionalString(model),
    status: requireKnownValue(status, PROVIDER_RUN_STATUS, 'status'),
    latency_ms: normalizeOptionalInteger(latencyMs, 'latencyMs'),
    input_metadata: sanitizeMetadata(inputMetadata),
    output_metadata: sanitizeMetadata(outputMetadata),
    error_code: normalizeOptionalString(errorCode),
    error_message: normalizeOptionalString(errorMessage),
    started_at: normalizeOptionalTimestamp(startedAt, 'startedAt'),
    completed_at: normalizeOptionalTimestamp(completedAt, 'completedAt'),
  };

  const { data, error } = await getSupabaseAdminClient()
    .from('provider_runs')
    .insert(payload)
    .select(PROVIDER_RUN_COLUMNS)
    .single();

  if (error) {
    throw createTranslationRepositoryError('record_provider_run', error);
  }

  return data;
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
  const payload = {
    job_id: normalizeRequiredString(jobId, 'jobId'),
    clerk_user_id: normalizeRequiredString(clerkUserId, 'clerkUserId'),
    openai_arabic_text: normalizeOptionalString(openaiArabicText),
    darija_arabic_text: normalizeOptionalString(darijaArabicText),
    consolidated_arabic_text: normalizeRequiredString(
      consolidatedArabicText,
      'consolidatedArabicText',
    ),
    english_text: normalizeRequiredString(englishText, 'englishText'),
    model_metadata: sanitizeMetadata(modelMetadata),
  };

  const { data, error } = await getSupabaseAdminClient()
    .from('translation_results')
    .insert(payload)
    .select(RESULT_COLUMNS)
    .single();

  if (error) {
    throw createTranslationRepositoryError('write_translation_result', error);
  }

  return data;
}

export async function listTranslationsForUser({
  clerkUserId,
  limit,
  cursor,
}) {
  const normalizedLimit = normalizeHistoryLimit(limit);
  const normalizedCursor = normalizeCursor(cursor);
  let query = getSupabaseAdminClient()
    .from('translation_jobs')
    .select(TRANSLATION_WITH_RESULT_COLUMNS)
    .eq('clerk_user_id', normalizeRequiredString(clerkUserId, 'clerkUserId'))
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(normalizedLimit + 1);

  if (normalizedCursor) {
    query = query.lt('created_at', normalizedCursor);
  }

  const { data, error } = await query;

  if (error) {
    throw createTranslationRepositoryError('list_translations_for_user', error);
  }

  const rows = Array.isArray(data) ? data : [];
  const items = rows.slice(0, normalizedLimit);
  const nextCursor =
    rows.length > normalizedLimit ? items.at(-1)?.created_at || null : null;

  return { items, nextCursor };
}

export async function getTranslationForUser({ clerkUserId, translationId }) {
  const { data, error } = await getSupabaseAdminClient()
    .from('translation_jobs')
    .select(TRANSLATION_DETAIL_COLUMNS)
    .eq('id', normalizeRequiredString(translationId, 'translationId'))
    .eq('clerk_user_id', normalizeRequiredString(clerkUserId, 'clerkUserId'))
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    throw createTranslationRepositoryError('get_translation_for_user', error);
  }

  return data;
}
