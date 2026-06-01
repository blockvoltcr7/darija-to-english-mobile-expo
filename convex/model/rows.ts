function nullable<T>(value: T | undefined): T | null {
  return value === undefined ? null : value;
}

export function toProfileRow(profile: any) {
  if (!profile) {
    return null;
  }

  return {
    id: String(profile._id),
    clerk_user_id: profile.clerkUserId,
    primary_email: nullable(profile.primaryEmail),
    display_name: nullable(profile.displayName),
    image_url: nullable(profile.imageUrl),
    created_at: profile.createdAt,
    updated_at: profile.updatedAt,
    deleted_at: nullable(profile.deletedAt),
  };
}

export function toTranslationJobRow(job: any) {
  if (!job) {
    return null;
  }

  return {
    id: job.jobId,
    clerk_user_id: job.clerkUserId,
    profile_id: nullable(job.profileId),
    status: job.status,
    source_filename: nullable(job.sourceFilename),
    source_audio_bytes: nullable(job.sourceAudioBytes),
    audio_storage_id: nullable(job.audioStorageId),
    audio_bucket: null,
    audio_object_key: null,
    audio_size_bytes: nullable(job.audioSizeBytes),
    audio_mime_type: nullable(job.audioMimeType),
    audio_retention_expires_at: nullable(job.audioRetentionExpiresAt),
    audio_deleted_at: nullable(job.audioDeletedAt),
    artifact_bucket: null,
    artifact_prefix: null,
    artifacts_deleted_at: null,
    trigger_run_id: nullable(job.triggerRunId),
    trace_id: nullable(job.traceId),
    error_code: nullable(job.errorCode),
    error_message: nullable(job.errorMessage),
    started_at: nullable(job.startedAt),
    completed_at: nullable(job.completedAt),
    created_at: job.createdAt,
    updated_at: job.updatedAt,
    deleted_at: nullable(job.deletedAt),
  };
}

export function toTranslationResultRow(result: any) {
  if (!result) {
    return null;
  }

  return {
    id: result.resultId,
    job_id: result.jobId,
    clerk_user_id: result.clerkUserId,
    openai_arabic_text: nullable(result.openaiArabicText),
    darija_arabic_text: nullable(result.darijaArabicText),
    consolidated_arabic_text: result.consolidatedArabicText,
    english_text: result.englishText,
    model_metadata: result.modelMetadata || {},
    created_at: result.createdAt,
    updated_at: result.updatedAt,
  };
}

export function toProviderRunRow(run: any) {
  if (!run) {
    return null;
  }

  return {
    id: run.runId,
    job_id: run.jobId,
    clerk_user_id: run.clerkUserId,
    provider: run.provider,
    operation: run.operation,
    model: nullable(run.model),
    status: run.status,
    latency_ms: nullable(run.latencyMs),
    input_metadata: run.inputMetadata || {},
    output_metadata: run.outputMetadata || {},
    error_code: nullable(run.errorCode),
    error_message: nullable(run.errorMessage),
    started_at: nullable(run.startedAt),
    completed_at: nullable(run.completedAt),
    created_at: run.createdAt,
  };
}

export function toArtifactRow(artifact: any) {
  if (!artifact) {
    return null;
  }

  return {
    id: artifact.artifactId,
    job_id: artifact.jobId,
    clerk_user_id: artifact.clerkUserId,
    kind: artifact.kind,
    status: artifact.status,
    provider: artifact.provider,
    model: artifact.model,
    voice: nullable(artifact.voice),
    language: artifact.language,
    format: artifact.format,
    mime_type: artifact.mimeType,
    bucket: null,
    object_key: null,
    storage_id: nullable(artifact.storageId),
    byte_size: nullable(artifact.byteSize),
    input_text_hash: artifact.inputTextHash,
    input_char_count: artifact.inputCharCount,
    duration_seconds: nullable(artifact.durationSeconds),
    error_code: nullable(artifact.errorCode),
    error_message: nullable(artifact.errorMessage),
    started_at: nullable(artifact.startedAt),
    completed_at: nullable(artifact.completedAt),
    created_at: artifact.createdAt,
    updated_at: artifact.updatedAt,
  };
}
