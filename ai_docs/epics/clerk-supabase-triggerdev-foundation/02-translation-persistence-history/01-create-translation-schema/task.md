# Task 01: Create Translation Schema

## Type

Migration

## Context

The app currently returns translation results only in the response. Durable history needs job, result, and provider-run tables keyed by `clerk_user_id`.

## Implementation

- Add migrations for `translation_jobs`, `translation_results`, and `provider_runs`.
- Include `clerk_user_id text not null`, job status, trace ID, provider operation, model, latency, cost/error fields, and timestamps.
- Add indexes on `clerk_user_id`, `created_at`, `job_id`, and `status`.

## Acceptance Criteria

- Tables support current sync flow and future async flow.
- No table depends on `auth.users`.
- Schema aligns with the ERD.

## Dependencies

- Depends On: 01-clerk-profile-sync/verify-profile-sync-end-to-end

## Technical Notes

- Use status values: `queued`, `running`, `succeeded`, `failed`, `canceled`.
- Reference: `ai_docs/visuals/clerk-supabase-triggerdev-foundation/02-clerk-native-supabase-erd.png`.

## Artifact Slots

- `artifacts/`: migration SQL and schema verification output.
- `references/`: ERD and data model notes.
- `resources/`: SQL inspection commands.
- `notes/`: schema decisions.
