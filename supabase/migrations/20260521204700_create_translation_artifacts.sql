-- Add durable generated-audio artifact metadata for English TTS playback.
--
-- Generated audio remains private user data. Mobile clients must use the
-- authenticated API route instead of direct table or Storage access.

begin;

create table if not exists public.translation_artifacts (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.translation_jobs(id) on delete cascade,
  clerk_user_id text not null,
  kind text not null,
  status text not null default 'queued',
  provider text not null,
  model text not null,
  voice text,
  language text not null default 'en',
  format text not null,
  mime_type text not null,
  bucket text,
  object_key text,
  byte_size integer,
  input_text_hash text not null,
  input_char_count integer not null,
  duration_seconds numeric,
  error_code text,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint translation_artifacts_kind_check
    check (kind in ('english_tts_audio')),
  constraint translation_artifacts_status_check
    check (status in ('queued', 'running', 'succeeded', 'failed', 'canceled')),
  constraint translation_artifacts_provider_check
    check (provider in ('openai')),
  constraint translation_artifacts_language_check
    check (language = 'en'),
  constraint translation_artifacts_format_check
    check (format in ('aac', 'mp3')),
  constraint translation_artifacts_bucket_check
    check (bucket is null or bucket = 'translation-artifacts'),
  constraint translation_artifacts_location_check
    check (
      (bucket is null and object_key is null)
      or (bucket is not null and object_key is not null)
    ),
  constraint translation_artifacts_byte_size_check
    check (byte_size is null or byte_size >= 0),
  constraint translation_artifacts_input_char_count_check
    check (input_char_count >= 0),
  constraint translation_artifacts_duration_seconds_check
    check (duration_seconds is null or duration_seconds >= 0),
  constraint translation_artifacts_completion_check
    check (completed_at is null or started_at is null or completed_at >= started_at)
);

comment on table public.translation_artifacts is
  'Server-owned generated artifact metadata for translation jobs, including English TTS audio.';

comment on column public.translation_artifacts.clerk_user_id is
  'Clerk user ID duplicated for ownership-filtered server reads.';

comment on column public.translation_artifacts.object_key is
  'Private Supabase Storage object key; never expose directly to mobile clients.';

comment on column public.translation_artifacts.input_text_hash is
  'Idempotency hash derived from English text and provider configuration.';

create unique index if not exists translation_artifacts_idempotency_idx
on public.translation_artifacts (
  job_id,
  kind,
  provider,
  model,
  coalesce(voice, ''),
  format,
  input_text_hash
);

create index if not exists translation_artifacts_job_id_created_at_idx
on public.translation_artifacts (job_id, created_at);

create index if not exists translation_artifacts_clerk_user_id_created_at_idx
on public.translation_artifacts (clerk_user_id, created_at desc);

create index if not exists translation_artifacts_status_created_at_idx
on public.translation_artifacts (status, created_at desc);

alter table public.translation_artifacts enable row level security;

revoke all on table public.translation_artifacts from anon;
revoke all on table public.translation_artifacts from authenticated;
grant select, insert, update, delete on table public.translation_artifacts to service_role;

drop trigger if exists translation_artifacts_set_updated_at on public.translation_artifacts;
create trigger translation_artifacts_set_updated_at
before update on public.translation_artifacts
for each row
execute function public.set_updated_at();

alter table public.provider_runs
  drop constraint if exists provider_runs_operation_check,
  add constraint provider_runs_operation_check
    check (operation in (
      'openai_transcription',
      'modal_darija_asr',
      'openai_consolidation',
      'openai_translation',
      'openai_tts'
    ));

commit;
