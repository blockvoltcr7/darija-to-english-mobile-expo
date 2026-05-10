# Task 02: Create Translation DB Writers

## Type

Code

## Context

The translation route should not write directly to Supabase from `server/index.mjs`. Epic 01 introduced `server/profiles.mjs` as the repository pattern for Clerk-owned data. This task creates the matching translation persistence layer so the API can record jobs, provider runs, results, and safe failures without spreading table-specific Supabase code through the route handler.

## Implementation

- Add `server/translations.mjs` and follow the validation/error-wrapper style in `server/profiles.mjs`.
- Use `getSupabaseAdminClient()` from `server/db.mjs`; never create a mobile/client Supabase import path.
- Export focused helpers such as `createTranslationJob`, `markTranslationJobRunning`, `recordProviderRun`, `writeTranslationResult`, `markTranslationJobSucceeded`, and `markTranslationJobFailed`.
- Normalize required inputs (`clerkUserId`, `jobId`, provider operation, status) and sanitize optional metadata before writes.
- Return selected columns needed by the API and history endpoints instead of leaking raw Supabase response objects.
- Keep writer failures explicit: route code should be able to distinguish provider failure from persistence failure.

## Acceptance Criteria

- [ ] `server/translations.mjs` centralizes all translation persistence writes.
- [ ] Every write helper requires or derives authenticated `clerk_user_id`.
- [ ] Success and failure helpers write durable, user-safe records.
- [ ] No mobile or `lib/` file imports Supabase admin credentials.
- [ ] `node --check server/translations.mjs server/index.mjs` passes after integration.

## Dependencies

- Depends On: `create-translation-schema`
- Blocks: `persist-sync-translation-results`
- Blocks: `add-history-api-endpoints`

## Technical Notes

- Closest pattern: `server/profiles.mjs` for input normalization, repository errors, and service-role Supabase access.
- Current server client: `server/db.mjs` exports `SUPABASE_PROJECT_REF = 'npjsersrmvltoxmqdkzd'`.
- Provider operation names should be stable strings: `openai_transcription`, `modal_darija_asr`, `openai_consolidation`, `openai_translation`.
- Do not dispatch Trigger.dev, upload audio to buckets, or change `/v1/translate-audio` behavior in this task.

## Artifact Slots

- `artifacts/`: repository helper review and sample DB write traces.
- `references/`: persistence layer contract and provider operation map.
- `resources/`: writer test cases and sample payload shapes.
- `notes/`: writer API decisions and error-handling tradeoffs.
