# Translation Data Model Reference

## Ownership

- Clerk remains the identity source.
- `clerk_user_id text not null` is the required ownership key on user-owned translation tables.
- `profile_id uuid` may be stored for internal joins, but access control must not depend on it.
- No table in this epic should reference `auth.users`.

## Tables

### `public.translation_jobs`

Purpose: one row per translation request/job.

Recommended fields:

- `id uuid primary key default gen_random_uuid()`
- `clerk_user_id text not null`
- `profile_id uuid null references public.profiles(id) on delete set null`
- `status text not null`
- `source_filename text`
- `source_audio_bytes integer`
- `trace_id text`
- `error_code text`
- `error_message text`
- `started_at timestamptz`
- `completed_at timestamptz`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `deleted_at timestamptz`

### `public.translation_results`

Purpose: final user-visible transcript/translation payload for a completed job.

Recommended fields:

- `id uuid primary key default gen_random_uuid()`
- `job_id uuid not null unique references public.translation_jobs(id) on delete cascade`
- `clerk_user_id text not null`
- `openai_arabic_text text`
- `darija_arabic_text text`
- `consolidated_arabic_text text not null`
- `english_text text not null`
- `model_metadata jsonb not null default '{}'::jsonb`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### `public.provider_runs`

Purpose: audit one provider/model operation inside a job.

Recommended fields:

- `id uuid primary key default gen_random_uuid()`
- `job_id uuid not null references public.translation_jobs(id) on delete cascade`
- `clerk_user_id text not null`
- `provider text not null`
- `operation text not null`
- `model text`
- `status text not null`
- `latency_ms integer`
- `input_metadata jsonb not null default '{}'::jsonb`
- `output_metadata jsonb not null default '{}'::jsonb`
- `error_code text`
- `error_message text`
- `started_at timestamptz`
- `completed_at timestamptz`
- `created_at timestamptz not null default now()`

## Safe Metadata Rule

Never store `audio_base64`, provider API keys, bearer tokens, raw request headers, or server stack traces.
