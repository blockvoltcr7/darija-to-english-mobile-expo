# Phase 3 Sync Persistence Verification

## Scope

- Task: `persist-sync-translation-results`
- Server route: `server/index.mjs` -> `handleTranslateAudio`
- Type contract: `lib/types.ts`

## Code Path

- Clerk auth still runs before the route through `requireClerkSession`.
- Profile resolution still runs before the route through `ensureProfileForRequest`.
- `validatePayload(req.body)` still runs before translation job creation.
- `createTranslationJob` runs after payload validation and before paid provider calls.
- The job is marked `running` before provider work starts.
- Provider/model operations are wrapped with `recordProviderOperation`:
  - Modal Darija ASR -> `modal_darija_asr`
  - OpenAI transcription -> `openai_transcription`
  - OpenAI consolidation -> `openai_consolidation`
  - OpenAI translation -> `openai_translation`
- STT still requires both OpenAI and Modal outputs before consolidation.
- Successful requests write one `translation_results` row and mark the job `succeeded`.
- Errors after job creation attempt to mark the job `failed` with safe error fields.
- The mobile response remains compatible; `jobId` and `translationJobId` are additive.

## Validation

- `node --check server/index.mjs && node --check server/translations.mjs`: passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `git diff --check`: passed.

## Runtime Notes

- No paid provider end-to-end request was executed in this phase.
- Live success/failure row examples should be captured during the final Epic 02 QA pass when a Clerk-authenticated request and test audio are intentionally exercised.
- Invalid auth still fails before the route handler because `requireClerkSession` precedes `handleTranslateAudio`.
- Invalid payload still fails before job creation because `validatePayload(req.body)` precedes `createTranslationJob`.
