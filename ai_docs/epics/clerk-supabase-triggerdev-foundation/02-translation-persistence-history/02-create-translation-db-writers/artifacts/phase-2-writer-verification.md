# Phase 2 Writer Verification

## Scope

- Task: `create-translation-db-writers`
- New module: `server/translations.mjs`
- Supabase boundary: `server/db.mjs` via `getSupabaseAdminClient()`

## Helper Surface

- `createTranslationJob`
- `markTranslationJobRunning`
- `recordProviderRun`
- `writeTranslationResult`
- `markTranslationJobSucceeded`
- `markTranslationJobFailed`

## Validation

- `node --check server/translations.mjs server/index.mjs`: passed.
- Repository writes require or derive `clerkUserId`.
- Job updates filter by both `jobId` and `clerk_user_id`.
- Provider operation names are exported as stable constants:
  - `openai_transcription`
  - `modal_darija_asr`
  - `openai_consolidation`
  - `openai_translation`
- Metadata sanitizer removes sensitive keys matching tokens, auth headers, secrets, stack traces, API keys, cookies, passwords, and audio base64.
- No mobile or `lib/` file imports the Supabase admin client or server credentials.

## Notes

- This task intentionally did not change route behavior.
- This task intentionally did not add history read helpers; those belong to `add-history-api-endpoints`.
- No production QA rows were created in this phase.
