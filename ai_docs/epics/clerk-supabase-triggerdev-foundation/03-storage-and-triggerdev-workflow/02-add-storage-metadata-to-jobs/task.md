# Task 02: Add Storage Metadata To Jobs

## Type

Migration

## Context

Epic 02 created durable `translation_jobs`, `translation_results`, and `provider_runs`, but live `translation_jobs` currently only stores request-level metadata such as filename, approximate byte count, trace ID, and status. Epic 03 needs additive schema fields so a job can point to private Supabase Storage objects and a Trigger.dev run without changing the Clerk ownership model. The app must continue to use `clerk_user_id` and optional `profile_id` as app ownership data; `storage.objects.owner_id` is not the source of truth.

## Implementation

- Create a Supabase migration file for project `npjsersrmvltoxmqdkzd` that adds nullable rollout fields to `public.translation_jobs`: `audio_bucket`, `audio_object_key`, `audio_size_bytes`, `audio_mime_type`, `audio_retention_expires_at`, `audio_deleted_at`, `artifact_bucket`, `artifact_prefix`, `artifacts_deleted_at`, and `trigger_run_id`.
- Add check constraints for non-negative audio size and known bucket names where practical, plus indexes for `trigger_run_id` and pending retention cleanup.
- Use object keys that avoid raw Clerk IDs and user filenames, preferably `jobs/<job_id>/original.<ext>` and `jobs/<job_id>/artifacts/`.
- Update `server/translations.mjs` column selections and repository contracts so later tasks can write/read storage metadata and Trigger.dev run IDs.

## Acceptance Criteria

- [ ] Migration is additive and safe for existing empty or sync-created job rows.
- [ ] `translation_jobs` can reference original audio and artifact object locations without storing audio bytes in Postgres.
- [ ] `trigger_run_id` can be stored and queried without making Trigger.dev the durable source of truth.
- [ ] Retention/deletion fields exist for Epic 04 cleanup.
- [ ] `server/translations.mjs` exposes the new columns through job/list/detail repository reads where needed.

## Dependencies

- Depends On: create-private-storage-buckets
- Blocks: add-server-side-audio-storage-flow
- Blocks: add-triggerdev-project-config
- Blocks: dispatch-triggerdev-from-api

## Technical Notes

- Current live columns were verified with Supabase MCP; none of the Epic 03 storage or Trigger columns exist yet.
- Keep `source_audio_bytes` for current sync compatibility. Use `audio_size_bytes` for the persisted object size after server-side decode/upload.
- Do not put user-provided filenames in object keys. `source_filename` can remain a sanitized display/support field.
- Use `public.set_updated_at()` behavior already established in Epic 00; do not add auth-related database triggers.
- Reference files: `supabase/migrations/20260510202655_create_translation_persistence_tables.sql`, `server/translations.mjs`, `server/index.mjs`.

## Artifact Slots

- `artifacts/`: migration review, Supabase MCP schema verification, and advisor notes if run.
- `references/`: storage diagram and Epic 02 translation data model references.
- `resources/`: SQL inspection commands for `translation_jobs`, indexes, and retention candidates.
- `notes/`: object key decision, nullable rollout decision, and Trigger run ID ownership notes.
