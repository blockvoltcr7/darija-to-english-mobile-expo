-- Add storage and Trigger.dev metadata to translation jobs.
--
-- Live target project ref: npjsersrmvltoxmqdkzd.
-- This migration is additive and keeps Clerk user IDs as the app ownership key.

begin;

alter table public.translation_jobs
  add column if not exists audio_bucket text,
  add column if not exists audio_object_key text,
  add column if not exists audio_size_bytes integer,
  add column if not exists audio_mime_type text,
  add column if not exists audio_retention_expires_at timestamptz,
  add column if not exists audio_deleted_at timestamptz,
  add column if not exists artifact_bucket text,
  add column if not exists artifact_prefix text,
  add column if not exists artifacts_deleted_at timestamptz,
  add column if not exists trigger_run_id text;

alter table public.translation_jobs
  drop constraint if exists translation_jobs_audio_size_bytes_check,
  add constraint translation_jobs_audio_size_bytes_check
    check (audio_size_bytes is null or audio_size_bytes >= 0),
  drop constraint if exists translation_jobs_audio_location_check,
  add constraint translation_jobs_audio_location_check
    check (
      (audio_bucket is null and audio_object_key is null)
      or (audio_bucket is not null and audio_object_key is not null)
    ),
  drop constraint if exists translation_jobs_audio_bucket_check,
  add constraint translation_jobs_audio_bucket_check
    check (audio_bucket is null or audio_bucket = 'audio-originals'),
  drop constraint if exists translation_jobs_artifact_location_check,
  add constraint translation_jobs_artifact_location_check
    check (
      (artifact_bucket is null and artifact_prefix is null)
      or (artifact_bucket is not null and artifact_prefix is not null)
    ),
  drop constraint if exists translation_jobs_artifact_bucket_check,
  add constraint translation_jobs_artifact_bucket_check
    check (artifact_bucket is null or artifact_bucket = 'translation-artifacts');

comment on column public.translation_jobs.audio_bucket is
  'Private Supabase Storage bucket for the original audio object.';

comment on column public.translation_jobs.audio_object_key is
  'Private Supabase Storage object key for the original audio.';

comment on column public.translation_jobs.audio_size_bytes is
  'Validated byte size of the uploaded original audio object.';

comment on column public.translation_jobs.audio_mime_type is
  'Normalized MIME type for the uploaded original audio object.';

comment on column public.translation_jobs.audio_retention_expires_at is
  'Future retention cutoff for original audio cleanup automation.';

comment on column public.translation_jobs.audio_deleted_at is
  'Timestamp when the original audio object was removed through the Storage API.';

comment on column public.translation_jobs.artifact_bucket is
  'Private Supabase Storage bucket for generated non-user-facing artifacts.';

comment on column public.translation_jobs.artifact_prefix is
  'Private Supabase Storage prefix for generated artifacts tied to this job.';

comment on column public.translation_jobs.artifacts_deleted_at is
  'Timestamp when generated artifacts were removed through the Storage API.';

comment on column public.translation_jobs.trigger_run_id is
  'Trigger.dev run ID for execution tracing; Supabase remains the durable app state.';

create index if not exists translation_jobs_trigger_run_id_idx
on public.translation_jobs (trigger_run_id)
where trigger_run_id is not null;

create index if not exists translation_jobs_audio_retention_expires_at_idx
on public.translation_jobs (audio_retention_expires_at)
where audio_retention_expires_at is not null and audio_deleted_at is null;

create index if not exists translation_jobs_audio_object_key_idx
on public.translation_jobs (audio_bucket, audio_object_key)
where audio_bucket is not null and audio_object_key is not null;

commit;
