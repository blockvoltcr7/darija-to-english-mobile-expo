# Task 02: Inventory Supabase Surfaces

## Type

Planning

## Context

Supabase is used server-side for profile rows, webhook idempotency, translation jobs, results, provider runs, storage object metadata, and health checks. The migration must replace these surfaces intentionally.

## Implementation

- Search for Supabase package imports and env vars.
- Inventory tables and repository functions.
- Inventory storage buckets, object keys, retention fields, and cleanup paths.
- Inventory mobile and API contracts that rely on Supabase-backed history.
- Separate source-controlled schema from live/project-only state.

## Acceptance Criteria

- Every Supabase dependency has an owner and migration destination.
- Storage and database responsibilities are separated.
- No secrets are printed or copied into artifacts.
- Unknown live-only state is called out as a blocker.

## Dependencies

- `verify-implementation-base`

## Validation Commands

```bash
rg -n "supabase|SUPABASE|@supabase" --glob '!node_modules/**' --glob '!refs/**'
rg -n "translation_jobs|translation_results|provider_runs|audio-originals|translation-artifacts" server supabase ai_docs
```

## Artifact Slots

- `artifacts/`: Supabase surface inventory.
- `references/`: source excerpts for schema and storage contracts.

