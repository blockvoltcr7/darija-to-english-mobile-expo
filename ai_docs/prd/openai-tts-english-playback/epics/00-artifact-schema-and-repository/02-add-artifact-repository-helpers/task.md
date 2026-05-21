# Task 02: Add Artifact Repository Helpers

## Type

Code

## Context

The server and Trigger worker need a small repository module for artifact lifecycle operations. This keeps SQL access and ownership checks out of route handlers and pipeline orchestration.

The PRD names the target module as `server/artifacts.mjs`.

## Implementation

- Add `server/artifacts.mjs`.
- Export helpers for:
  - finding an existing successful TTS artifact for a job/user/provider config/hash,
  - creating or marking a TTS artifact as running,
  - marking a TTS artifact as succeeded with storage metadata,
  - marking a TTS artifact as failed with safe error metadata,
  - fetching the successful English TTS artifact for a user-owned translation.
- Reuse the existing Supabase server client conventions from `server/translations.mjs`.
- Require `clerk_user_id` in all read/update paths that operate on user-owned artifacts.
- Normalize returned rows into safe JavaScript objects, not raw Supabase response internals.
- Add concise safe error handling consistent with existing server repository helpers.

## Acceptance Criteria

- [ ] `server/artifacts.mjs` exists and passes `node --check server/artifacts.mjs`.
- [ ] Repository helpers enforce both `job_id` and `clerk_user_id` where ownership matters.
- [ ] Successful artifact lookup uses provider, model, voice, format, and input text hash.
- [ ] Failure writes use safe `error_code` and `error_message` fields only.
- [ ] Helpers do not log or return private audio bytes, provider secrets, Clerk tokens, or Supabase service credentials.

## Dependencies

- Depends On: create-translation-artifacts-migration
- Blocks: extend-provider-run-operation-contract
- Blocks: run-tts-after-translation-success
- Blocks: add-tts-detail-response-shape

## Technical Notes

- The repository should treat Supabase as the durable state store; Trigger.dev run IDs are execution metadata elsewhere.
- Prefer explicit helper names that match lifecycle transitions so later pipeline code reads as state-machine steps.
- If upsert is used for idempotency, preserve safe behavior under retry races and document the chosen conflict target.

## Artifact Slots

- `artifacts/`: repository smoke-check output and example sanitized rows.
- `references/`: current `server/translations.mjs` patterns and PRD repository contract.
- `resources/`: sample helper-call payloads and forced-failure cases.
- `notes/`: idempotency race decisions and Supabase error handling notes.

