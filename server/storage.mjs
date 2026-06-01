import { randomUUID } from 'node:crypto';
import { callConvexFunction } from './db.mjs';
import { env } from './env.mjs';

export const TRANSLATION_ARTIFACT_OUTPUT_FORMATS = Object.freeze({
  aac: Object.freeze({ format: 'aac', mimeType: 'audio/aac', extension: 'aac' }),
  mp3: Object.freeze({ format: 'mp3', mimeType: 'audio/mpeg', extension: 'mp3' }),
});

const DATA_URI_PATTERN = /^data:([^;,]+);base64,(.*)$/is;
const BASE64_PATTERN = /^[A-Za-z0-9+/]*={0,2}$/;
const SUPPORTED_AUDIO_EXTENSIONS = new Map([
  ['aac', 'audio/aac'],
  ['m4a', 'audio/x-m4a'],
  ['mp3', 'audio/mpeg'],
  ['mp4', 'audio/mp4'],
  ['oga', 'audio/ogg'],
  ['ogg', 'audio/ogg'],
  ['wav', 'audio/wav'],
  ['weba', 'audio/webm'],
  ['webm', 'audio/webm'],
]);
const SUPPORTED_AUDIO_MIME_TYPES = new Set([
  'audio/aac',
  'audio/m4a',
  'audio/mp4',
  'audio/mpeg',
  'audio/ogg',
  'audio/wav',
  'audio/webm',
  'audio/x-m4a',
]);
const MIME_EXTENSION = new Map([
  ['audio/aac', 'aac'],
  ['audio/m4a', 'm4a'],
  ['audio/mp4', 'm4a'],
  ['audio/mpeg', 'mp3'],
  ['audio/ogg', 'ogg'],
  ['audio/wav', 'wav'],
  ['audio/webm', 'webm'],
  ['audio/x-m4a', 'm4a'],
]);

function storageError(status, code, message, cause) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  error.cause = cause;
  return error;
}

function base64Payload(audioBase64) {
  const match = DATA_URI_PATTERN.exec(audioBase64);

  if (match) {
    return {
      mimeType: match[1].trim().toLowerCase(),
      payload: match[2],
    };
  }

  return {
    mimeType: null,
    payload: audioBase64,
  };
}

function extensionFromFilename(filename) {
  const normalized = filename.trim().toLowerCase();
  const extension = normalized.includes('.')
    ? normalized.split('.').pop()?.replace(/[^a-z0-9]/g, '')
    : '';

  return extension || null;
}

function normalizeAudioMimeType({ filename, mimeType }) {
  const normalizedMimeType = mimeType?.toLowerCase() || null;

  if (
    normalizedMimeType &&
    SUPPORTED_AUDIO_MIME_TYPES.has(normalizedMimeType)
  ) {
    return normalizedMimeType;
  }

  const extension = extensionFromFilename(filename);
  const extensionMimeType = extension
    ? SUPPORTED_AUDIO_EXTENSIONS.get(extension)
    : null;

  if (extensionMimeType) {
    return extensionMimeType;
  }

  throw storageError(
    415,
    'unsupported_audio_type',
    'Unsupported audio file type.',
  );
}

function normalizeBase64(audioBase64) {
  const { mimeType, payload } = base64Payload(audioBase64);
  const normalized = payload.replace(/\s+/g, '');

  if (!normalized || normalized.length % 4 === 1 || !BASE64_PATTERN.test(normalized)) {
    throw storageError(400, 'invalid_audio_base64', 'audio_base64 is invalid.');
  }

  return {
    mimeType,
    payload: normalized,
  };
}

function safePathSegment(value) {
  return value.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 120);
}

function requireNonEmptyString(value, fieldName) {
  if (typeof value !== 'string') {
    throw storageError(400, `${fieldName}_missing`, `${fieldName} is required.`);
  }

  const normalized = value.trim();

  if (!normalized) {
    throw storageError(400, `${fieldName}_empty`, `${fieldName} is empty.`);
  }

  return normalized;
}

function resolveArtifactOutputFormat(format) {
  const normalized = requireNonEmptyString(format, 'format').toLowerCase();
  const metadata = TRANSLATION_ARTIFACT_OUTPUT_FORMATS[normalized];

  if (!metadata) {
    throw storageError(400, 'unsupported_artifact_format', 'Unsupported artifact format.');
  }

  return metadata;
}

function retentionExpiresAt() {
  return new Date(
    Date.now() + env.AUDIO_RETENTION_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();
}

export function prepareAudioForStorage({ filename, audioBase64 }) {
  const normalizedFilename =
    typeof filename === 'string' && filename.trim()
      ? filename.trim()
      : `audio-${Date.now()}.m4a`;
  const normalizedBase64 = normalizeBase64(audioBase64);
  const buffer = Buffer.from(normalizedBase64.payload, 'base64');

  if (buffer.length === 0) {
    throw storageError(400, 'empty_audio', 'Audio payload is empty.');
  }

  if (buffer.length > env.AUDIO_UPLOAD_MAX_BYTES) {
    throw storageError(413, 'audio_too_large', 'Audio file is too large.');
  }

  const mimeType = normalizeAudioMimeType({
    filename: normalizedFilename,
    mimeType: normalizedBase64.mimeType,
  });
  const extension =
    MIME_EXTENSION.get(mimeType) || extensionFromFilename(normalizedFilename) || 'm4a';

  return {
    filename: normalizedFilename,
    audioBase64: normalizedBase64.payload,
    buffer,
    sizeBytes: buffer.length,
    mimeType,
    extension,
  };
}

export function buildOriginalAudioObjectKey({ clerkUserId, jobId, extension }) {
  const userSegment = safePathSegment(clerkUserId);
  const jobSegment = safePathSegment(jobId);
  const suffix = safePathSegment(randomUUID());

  return `users/${userSegment}/jobs/${jobSegment}/original-${suffix}.${extension}`;
}

export function buildTranslationArtifactObjectKey({
  clerkUserId,
  jobId,
  artifactId,
  format,
  kind = 'english-tts',
}) {
  const outputFormat = resolveArtifactOutputFormat(format);
  const userSegment = safePathSegment(requireNonEmptyString(clerkUserId, 'clerkUserId'));
  const jobSegment = safePathSegment(requireNonEmptyString(jobId, 'jobId'));
  const artifactSegment = safePathSegment(
    requireNonEmptyString(artifactId, 'artifactId'),
  );
  const kindSegment = safePathSegment(requireNonEmptyString(kind, 'kind'));

  return [
    'users',
    userSegment,
    'jobs',
    jobSegment,
    'artifacts',
    artifactSegment,
    `${kindSegment}.${outputFormat.extension}`,
  ].join('/');
}

async function uploadBufferToConvexStorage({ buffer, mimeType }) {
  const { uploadUrl } = await callConvexFunction('storage:generateUploadUrl');
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Type': mimeType,
    },
    body: buffer,
  });

  if (!response.ok) {
    throw storageError(
      502,
      'convex_storage_upload_failed',
      'Storage upload failed.',
    );
  }

  const payload = await response.json();

  if (!payload?.storageId) {
    throw storageError(
      502,
      'convex_storage_upload_missing_id',
      'Storage upload did not return a storage ID.',
    );
  }

  return payload.storageId;
}

export async function uploadOriginalAudioForJob({ clerkUserId, jobId, audio }) {
  try {
    const storageId = await uploadBufferToConvexStorage({
      buffer: audio.buffer,
      mimeType: audio.mimeType,
    });

    return {
      storageId,
      sizeBytes: audio.sizeBytes,
      mimeType: audio.mimeType,
      retentionExpiresAt: retentionExpiresAt(),
    };
  } catch (error) {
    throw storageError(
      502,
      'audio_storage_upload_failed',
      'Audio upload failed.',
      error,
    );
  }
}

export async function uploadTranslationArtifact({
  clerkUserId,
  jobId,
  artifactId,
  audioBuffer,
  format,
  kind,
}) {
  const outputFormat = resolveArtifactOutputFormat(format);

  if (!Buffer.isBuffer(audioBuffer) || audioBuffer.length === 0) {
    throw storageError(400, 'empty_artifact_audio', 'Artifact audio payload is empty.');
  }

  try {
    const storageId = await uploadBufferToConvexStorage({
      buffer: audioBuffer,
      mimeType: outputFormat.mimeType,
    });

    return {
      storageId,
      byteSize: audioBuffer.length,
      mimeType: outputFormat.mimeType,
      format: outputFormat.format,
      extension: outputFormat.extension,
    };
  } catch (error) {
    throw storageError(
      502,
      'translation_artifact_upload_failed',
      'Translation artifact upload failed.',
      error,
    );
  }
}

export async function downloadStoredObject({ storageId }) {
  const { url } = await callConvexFunction('storage:getStorageUrl', {
    storageId: requireNonEmptyString(storageId, 'storageId'),
  });

  if (!url) {
    throw storageError(
      404,
      'storage_object_not_found',
      'Stored object was not found.',
    );
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw storageError(
      502,
      'storage_download_failed',
      'Stored object download failed.',
    );
  }

  return Buffer.from(await response.arrayBuffer());
}

export async function removeStoredObject({ storageId }) {
  try {
    await callConvexFunction('storage:deleteStoredObject', {
      storageId: requireNonEmptyString(storageId, 'storageId'),
    });
  } catch (error) {
    throw storageError(
      502,
      'storage_remove_failed',
      'Stored object removal failed.',
      error,
    );
  }
}
