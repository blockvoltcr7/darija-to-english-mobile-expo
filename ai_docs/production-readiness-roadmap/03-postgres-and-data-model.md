# Postgres And Data Model

## Recommendation

Use Postgres. The product needs durable state, history, usage metering, entitlements, and support diagnostics.

Default choice: Supabase Postgres plus Supabase Storage, with Clerk as the identity provider.

Why this fits the current repo:

- Clerk is already implemented and verified. Do not replace it with Supabase Auth.
- Supabase has first-class support for Clerk as a third-party auth provider.
- Supabase gives Postgres, Storage, Realtime, and a dashboard in one place.
- The app will need object storage and user-owned rows quickly.

Alternative: Neon Postgres plus separate object storage.

Choose Neon if the priority is database branching and a more custom backend stack. Expect more work for storage, realtime/polling, and app-level authorization.

## Identity Model

Clerk remains the source of identity. Store Clerk user IDs as text.

Do not use `auth.users` as the app user source unless deliberately moving back to Supabase Auth.

Core mapping:

```sql
create table profiles (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  primary_email text,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Every product table should be owned through `profile_id` or `clerk_user_id`. For server-owned APIs, using `clerk_user_id text` directly can keep early implementation simple.

## Minimum V1 Schema

### profiles

Purpose: one app profile per Clerk user.

Important fields:

- `id`
- `clerk_user_id`
- `primary_email`
- `display_name`
- `created_at`
- `updated_at`
- `deleted_at`

### translation_jobs

Purpose: durable job/status row for every translation attempt.

Important fields:

- `id`
- `clerk_user_id`
- `status`: `queued`, `running`, `succeeded`, `failed`, `canceled`
- `source`: `recording` or `upload`
- `filename`
- `mime_type`
- `audio_object_key`
- `audio_size_bytes`
- `estimated_duration_seconds`
- `actual_duration_seconds`
- `idempotency_key`
- `error_code`
- `error_message`
- `trace_id`
- `created_at`
- `updated_at`
- `completed_at`

### translation_results

Purpose: final and raw model outputs.

Important fields:

- `id`
- `job_id`
- `clerk_user_id`
- `openai_arabic_text`
- `darija_arabic_text`
- `consolidated_arabic_text`
- `english_text`
- `created_at`

The current server response maps directly to these fields:

- `openaiArabicText` -> `openai_arabic_text`
- `darijaArabicText` -> `darija_arabic_text`
- `consolidatedArabicText` or `transcript` -> `consolidated_arabic_text`
- `englishText` or `translation` -> `english_text`

### provider_runs

Purpose: trace each OpenAI and Modal call for support, reliability, and cost controls.

Important fields:

- `id`
- `job_id`
- `provider`: `openai` or `modal`
- `operation`: `openai_stt`, `darija_asr`, `consolidation`, `translation`
- `model`
- `status`
- `latency_ms`
- `input_bytes`
- `input_chars`
- `output_chars`
- `estimated_cost_usd`
- `error_code`
- `error_message`
- `created_at`

### usage_ledger

Purpose: immutable usage accounting and quota enforcement.

Important fields:

- `id`
- `clerk_user_id`
- `job_id`
- `entry_type`: `reservation`, `final_charge`, `release`, `adjustment`
- `seconds`
- `estimated_cost_usd`
- `reason`
- `created_at`

### entitlement_snapshots

Purpose: trusted backend copy of subscription state.

Important fields:

- `id`
- `clerk_user_id`
- `provider`: `revenuecat`
- `entitlement_id`
- `is_active`
- `period_started_at`
- `period_ends_at`
- `raw_payload`
- `updated_at`

## Access Control Direction

For the fastest v1:

- Mobile app calls only the server API.
- Server verifies Clerk sessions.
- Server uses a service DB connection.
- Every query includes the authenticated `clerk_user_id`.
- RLS can be added or enabled in parallel for defense in depth.

For direct Supabase client access later:

- Configure Supabase third-party auth for Clerk.
- Use Clerk session tokens with the Supabase client.
- Write RLS policies against Clerk JWT claims.

## Storage Model

Private bucket examples:

- `audio-originals`
- `translation-artifacts`

Object key pattern:

```text
users/<clerk_user_id>/jobs/<job_id>/original.<ext>
users/<clerk_user_id>/jobs/<job_id>/metadata.json
```

Retention policy decision:

- MVP default: keep audio for a short window, for example 7 or 30 days, then delete.
- Keep transcripts/history longer unless the user deletes their account.
- Expose retention policy in privacy policy.

## Implementation Order

1. Add DB migrations for `profiles`, `translation_jobs`, `translation_results`, and `provider_runs`.
2. Add server DB client and environment validation.
3. Upsert `profiles` from Clerk user ID on authenticated requests.
4. Persist completed sync translations without changing mobile UX.
5. Add history endpoint and history UI.
6. Add storage.
7. Convert the endpoint to async job creation.
8. Add usage and entitlement tables.
