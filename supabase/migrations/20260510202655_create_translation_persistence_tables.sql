-- Add durable translation persistence tables for sync history and future jobs.
--
-- Live target project ref / MCP project_id: npjsersrmvltoxmqdkzd.
-- Applied through Supabase MCP per project execution rule.

begin;

create table public.translation_jobs (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  profile_id uuid references public.profiles(id) on delete set null,
  status text not null default 'queued',
  source_filename text,
  source_audio_bytes integer,
  trace_id text,
  error_code text,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint translation_jobs_status_check
    check (status in ('queued', 'running', 'succeeded', 'failed', 'canceled')),
  constraint translation_jobs_source_audio_bytes_check
    check (source_audio_bytes is null or source_audio_bytes >= 0),
  constraint translation_jobs_completion_check
    check (completed_at is null or started_at is null or completed_at >= started_at)
);

comment on table public.translation_jobs is
  'Server-owned translation request/job envelope keyed by Clerk user ID.';

comment on column public.translation_jobs.clerk_user_id is
  'Clerk user ID; durable app ownership key for server-mediated access.';

comment on column public.translation_jobs.profile_id is
  'Optional internal join to the app profile row; not the access-control key.';

comment on column public.translation_jobs.trace_id is
  'Request trace identifier supplied by the API/client for support diagnostics.';

create table public.translation_results (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null unique references public.translation_jobs(id) on delete cascade,
  clerk_user_id text not null,
  openai_arabic_text text,
  darija_arabic_text text,
  consolidated_arabic_text text not null,
  english_text text not null,
  model_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.translation_results is
  'Final user-visible transcript and translation payload for a translation job.';

comment on column public.translation_results.clerk_user_id is
  'Clerk user ID duplicated for direct ownership-filtered reads.';

comment on column public.translation_results.model_metadata is
  'Safe model/provider metadata for response reconstruction and support.';

create table public.provider_runs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.translation_jobs(id) on delete cascade,
  clerk_user_id text not null,
  provider text not null,
  operation text not null,
  model text,
  status text not null,
  latency_ms integer,
  input_metadata jsonb not null default '{}'::jsonb,
  output_metadata jsonb not null default '{}'::jsonb,
  error_code text,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint provider_runs_provider_check
    check (provider in ('openai', 'modal')),
  constraint provider_runs_operation_check
    check (operation in (
      'openai_transcription',
      'modal_darija_asr',
      'openai_consolidation',
      'openai_translation'
    )),
  constraint provider_runs_status_check
    check (status in ('running', 'succeeded', 'failed', 'canceled')),
  constraint provider_runs_latency_ms_check
    check (latency_ms is null or latency_ms >= 0),
  constraint provider_runs_completion_check
    check (completed_at is null or started_at is null or completed_at >= started_at)
);

comment on table public.provider_runs is
  'Server-owned audit rows for model/provider operations inside a translation job.';

comment on column public.provider_runs.clerk_user_id is
  'Clerk user ID duplicated for direct ownership-filtered support queries.';

comment on column public.provider_runs.input_metadata is
  'Safe input metadata only; never store audio base64, secrets, tokens, or raw headers.';

comment on column public.provider_runs.output_metadata is
  'Safe output metadata only; never store raw provider secrets or stack traces.';

create index translation_jobs_clerk_user_id_created_at_idx
on public.translation_jobs (clerk_user_id, created_at desc);

create index translation_jobs_status_created_at_idx
on public.translation_jobs (status, created_at desc);

create index translation_jobs_trace_id_idx
on public.translation_jobs (trace_id)
where trace_id is not null;

create index translation_jobs_profile_id_idx
on public.translation_jobs (profile_id)
where profile_id is not null;

create index translation_results_clerk_user_id_created_at_idx
on public.translation_results (clerk_user_id, created_at desc);

create index provider_runs_job_id_created_at_idx
on public.provider_runs (job_id, created_at);

create index provider_runs_clerk_user_id_created_at_idx
on public.provider_runs (clerk_user_id, created_at desc);

create index provider_runs_operation_status_idx
on public.provider_runs (operation, status);

alter table public.translation_jobs enable row level security;
alter table public.translation_results enable row level security;
alter table public.provider_runs enable row level security;

revoke all on table public.translation_jobs from anon;
revoke all on table public.translation_jobs from authenticated;
revoke all on table public.translation_results from anon;
revoke all on table public.translation_results from authenticated;
revoke all on table public.provider_runs from anon;
revoke all on table public.provider_runs from authenticated;

grant select, insert, update, delete on table public.translation_jobs to service_role;
grant select, insert, update, delete on table public.translation_results to service_role;
grant select, insert, update, delete on table public.provider_runs to service_role;

drop trigger if exists translation_jobs_set_updated_at on public.translation_jobs;
create trigger translation_jobs_set_updated_at
before update on public.translation_jobs
for each row
execute function public.set_updated_at();

drop trigger if exists translation_results_set_updated_at on public.translation_results;
create trigger translation_results_set_updated_at
before update on public.translation_results
for each row
execute function public.set_updated_at();

commit;
