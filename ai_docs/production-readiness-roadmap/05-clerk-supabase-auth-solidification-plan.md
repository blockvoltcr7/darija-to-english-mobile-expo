# Clerk And Supabase Auth Solidification Plan

Date: 2026-05-09

## Decision

Stay with Clerk for authentication.

Use Supabase for:

- Postgres product state.
- Private file buckets.
- Optional Clerk-aware RLS later.

Do not build new product tables around `auth.users`. That table belongs to Supabase Auth, and this app is no longer using Supabase Auth as the identity source.

## Important Trigger Boundary

Postgres triggers cannot fire when a user signs up in Clerk because Clerk signup happens outside Postgres.

Use these mechanisms instead:

- Clerk webhook for `user.created`, `user.updated`, and `user.deleted` events.
- Server-side lazy profile upsert on every authenticated API request.
- Postgres triggers only for database-owned side effects, such as `updated_at`, job status timestamps, usage ledger invariants, and cleanup metadata.

The reliable starting point is not an `auth.users` trigger. It is a Clerk-to-server webhook plus an idempotent `getOrCreateProfile(clerkUserId)` path in the API.

## Recommended Initial Architecture

```text
Clerk native auth
  -> mobile receives Clerk session
  -> mobile calls app API with Authorization: Bearer <Clerk session token>
  -> app API verifies Clerk session
  -> app API upserts/loads Supabase profile by clerk_user_id
  -> app API creates translation job row
  -> app API stores audio in Supabase bucket or accepts an uploaded object key
  -> Trigger.dev runs async translation workflow
  -> Trigger.dev writes provider runs and results back to Supabase
  -> mobile reads job/history through app API
```

Supabase remains the durable state machine. Trigger.dev executes work; it should not become the source of truth.

## Phase 1: Replace The Supabase Auth Profile Shape

Current live DB shape is Supabase Auth-oriented:

```text
public.profiles.user_id uuid primary key references auth.users(id)
```

Target Clerk-oriented shape:

```sql
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  primary_email text,
  display_name text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
```

Recommended path for this project:

1. Create a new migration that renames or replaces the current `public.profiles` table.
2. Use `clerk_user_id text not null unique` as the durable identity key.
3. Do not rely on `auth.uid()` policies for app-owned tables.
4. Keep API access server-owned at first: the mobile app talks to the API, and the API queries Supabase with a server-side credential.

If the existing Supabase Auth `profiles` table has no real rows, replacing it is simpler than carrying a confusing legacy shape forward.

## Phase 2: Add Clerk Webhook Sync

Create an authenticated webhook endpoint:

```text
POST /v1/webhooks/clerk
```

Events to handle:

- `user.created`: upsert `profiles`.
- `user.updated`: update email, display name, image URL.
- `user.deleted`: soft-delete profile with `deleted_at`.

Security requirements:

- Verify the Clerk webhook signature.
- Reject unsigned or invalid webhook requests.
- Make the handler idempotent.
- Store enough event metadata to debug duplicates and failures.

Suggested table:

```sql
create table public.clerk_webhook_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null unique,
  event_type text not null,
  clerk_user_id text,
  processed_at timestamptz not null default now(),
  payload jsonb not null
);
```

The webhook is for fast profile synchronization. It is not the only safety net.

## Phase 3: Add Lazy Profile Upsert In The API

Every authenticated API request should call:

```text
getOrCreateProfile(clerkUserId)
```

This protects against:

- Missed webhook deliveries.
- Webhook processing delays.
- Local development where webhooks are not configured.
- Backfilled test users.

Minimum behavior:

- Verify Clerk session.
- Extract `clerk_user_id`.
- Upsert `profiles.clerk_user_id`.
- Return the profile ID to downstream DB writes.

This should happen before model calls, storage writes, or Trigger.dev job dispatch.

## Phase 4: Add Database-Owned Triggers

Use Postgres triggers only where Postgres owns the event.

Recommended initial triggers:

- `set_updated_at` trigger for `profiles`, `translation_jobs`, and other mutable tables.
- Job status transition helper to set `completed_at` when status becomes `succeeded`, `failed`, or `canceled`.

Avoid:

- Triggers on `auth.users`.
- Triggers that call external services.
- Triggers that attempt to infer Clerk state from Supabase Auth state.

## Phase 5: Add Translation Job Tables For Trigger.dev

Create:

```text
translation_jobs
translation_results
provider_runs
```

Add Trigger.dev linkage on `translation_jobs`:

```text
trigger_run_id text
trigger_task_identifier text
queued_at timestamptz
started_at timestamptz
completed_at timestamptz
```

Status flow:

```text
queued -> running -> succeeded
queued -> running -> failed
queued -> canceled
```

The API creates the job row, then dispatches Trigger.dev. The Trigger.dev task updates the job and writes result/provider rows.

## Phase 6: Add Supabase Buckets

Create private buckets:

```text
audio-originals
translation-artifacts
```

Object key pattern:

```text
users/<clerk_user_id>/jobs/<job_id>/original.<ext>
users/<clerk_user_id>/jobs/<job_id>/metadata.json
```

Database columns on `translation_jobs`:

```text
audio_bucket text
audio_object_key text
audio_size_bytes bigint
mime_type text
retention_expires_at timestamptz
```

Keep bucket access private. The server and Trigger.dev should use server-side credentials. The mobile app should not receive broad bucket permissions.

## Phase 7: Add Clerk-Aware Supabase RLS Later

For the fastest production path:

- App API verifies Clerk.
- App API queries Supabase server-side.
- Every query filters by `clerk_user_id`.

Later, if the mobile app needs direct Supabase reads:

- Configure Supabase third-party auth for Clerk.
- Use Clerk JWTs with Supabase.
- Add RLS policies based on Clerk claims.

Do not block the first persistence epic on direct mobile-to-Supabase RLS. Server-mediated access is simpler and safer for the current app.

## Recommended Start

Start with a small `clerk-supabase-foundation` epic:

1. Add a migration-backed Clerk-native `profiles` table.
2. Add `updated_at` Postgres trigger.
3. Add server DB environment/config module.
4. Add `getOrCreateProfile(clerkUserId)`.
5. Call it after Clerk verification in `/v1/translate-audio`.
6. Add Clerk webhook endpoint and event table.
7. Verify a Clerk-authenticated request creates/updates `profiles`.

Then begin the larger `production-persistence-and-history` epic:

1. Add translation job/result/provider tables.
2. Add private audio bucket.
3. Create job rows before translation.
4. Dispatch Trigger.dev jobs.
5. Persist final results.
6. Add history endpoints and UI.

## Acceptance Criteria

- New Clerk users get a `profiles` row through webhook or first authenticated API call.
- API requests do not depend on `auth.users`.
- No mobile code has Supabase service credentials.
- Postgres triggers only handle database-local state.
- A missed Clerk webhook does not prevent the first API request from creating a profile.
- The schema is ready for Trigger.dev job IDs and Supabase bucket object keys.
