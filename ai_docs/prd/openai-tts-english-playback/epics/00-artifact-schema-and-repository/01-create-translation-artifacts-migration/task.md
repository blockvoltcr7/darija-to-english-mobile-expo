# Task 01: Create Translation Artifacts Migration

## Type

RLS

## Context

OpenAI TTS output needs durable state that is separate from the existing translation text result. The PRD targets a new `public.translation_artifacts` table keyed to `public.translation_jobs(id)` with Clerk ownership, artifact lifecycle status, provider/model/voice/format metadata, storage location, byte size, input hash, and safe error fields.

This table is the security foundation for later playback work. The mobile app must never receive service-role access or private Supabase object keys.

## Implementation

- Create `supabase/migrations/<timestamp>_create_translation_artifacts.sql` using the repo migration naming convention.
- Add `public.translation_artifacts` with the PRD fields: `id`, `job_id`, `clerk_user_id`, `kind`, `status`, provider/model/voice/language/format metadata, `mime_type`, storage bucket/object key, size/duration, input hash/count, safe error fields, and timestamps.
- Add check constraints for `kind = 'english_tts_audio'`, allowed statuses, provider `openai`, language `en`, formats `aac` and `mp3`, private bucket `translation-artifacts`, non-negative sizes/counts/durations, and valid completion timing.
- Add the idempotency unique index over job, kind, provider, model, voice, format, and input hash.
- Add lookup indexes for job and Clerk user history.
- Enable RLS, revoke direct `anon` and `authenticated` access, and grant table access only to `service_role`.
- Reuse or create the local updated-at trigger pattern already used in this repo.

## Acceptance Criteria

- [ ] Migration creates `public.translation_artifacts` with the fields and constraints from `06-technical-specifications.md`.
- [ ] RLS is enabled and direct client roles cannot select, insert, update, or delete artifact rows.
- [ ] `service_role` can manage artifact rows for server and Trigger.dev workflows.
- [ ] Idempotency index prevents duplicate successful/regenerated artifacts for the same job/text/provider config.
- [ ] Artifact rows cascade when the owning translation job is deleted.

## Dependencies

- Depends On: existing translation job schema
- Blocks: add-artifact-repository-helpers
- Blocks: add-server-tts-env-contract

## Technical Notes

- Use `clerk_user_id text` as the ownership column, consistent with the Clerk-native app data model.
- Keep generated audio in a private `translation-artifacts` bucket; this migration should store metadata, not create public access.
- Do not add permissive RLS policies for mobile clients. All access should go through authenticated server routes.

## Artifact Slots

- `artifacts/`: schema review notes, migration apply output, table/index/RLS verification.
- `references/`: excerpts from `06-technical-specifications.md` and existing migration conventions.
- `resources/`: SQL inspection queries for constraints, indexes, grants, and RLS status.
- `notes/`: decisions about updated-at trigger reuse, index shape, and retention assumptions.

