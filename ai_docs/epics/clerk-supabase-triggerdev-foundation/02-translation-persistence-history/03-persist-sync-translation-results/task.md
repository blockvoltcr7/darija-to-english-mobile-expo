# Task 03: Persist Sync Translation Results

## Type

Code

## Context

`POST /v1/translate-audio` is still the primary product workflow: it verifies Clerk, resolves a profile, runs Modal/OpenAI, and returns transcripts plus English translation to the app. This task adds persistence around that exact synchronous flow so history exists before Epic 03 changes execution to async jobs.

## Implementation

- Update `server/index.mjs` inside `handleTranslateAudio` after `validatePayload(req.body)` and after `ensureProfileForRequest` has populated `req.profile`.
- Create a `translation_jobs` row before paid provider calls with `clerk_user_id`, optional `profile_id`, filename, approximate audio bytes, and `trace_id`.
- Wrap existing calls to `transcribeAudio`, `transcribeAudioWithOpenAI`, `consolidateArabicTranscript`, and `translateConsolidatedTranscript` so each successful or failed provider operation records a `provider_runs` row.
- Write one `translation_results` row on success, then mark the job `succeeded`.
- On failure after job creation, mark the job `failed` with a safe message and preserve the existing API error handling behavior.
- Keep the current response payload compatible; any new `jobId`/`translationJobId` field must be additive.

## Acceptance Criteria

- [ ] Existing mobile fields (`transcript`, `translation`, `openaiArabicText`, `darijaArabicText`, `consolidatedArabicText`, `englishText`, `asr`) still exist.
- [ ] Successful requests create one job, one result, and provider-run rows for each completed operation.
- [ ] Failed provider or consolidation/translation requests mark the job `failed` without storing secrets, headers, audio base64, or stack traces.
- [ ] Invalid auth still fails before DB or provider calls.
- [ ] Invalid payload still fails before provider calls and does not create a translation job.

## Dependencies

- Depends On: `create-translation-db-writers`
- Blocks: `add-history-api-endpoints`
- Blocks: `add-mobile-history-surface`

## Technical Notes

- Current route registration is in `server/index.mjs` for `/v1/translate-audio` and `/translate-audio`.
- Current response contract is mirrored in `lib/types.ts` and consumed in `app/index.tsx`; update types only for additive fields.
- Keep OpenAI and Modal provider call order semantically unchanged: both STT outputs are required before consolidation.
- If using `Promise.allSettled` to capture both STT run records, still return an error when either STT provider fails.
- Do not introduce Supabase buckets, Trigger.dev dispatch, polling, or new mobile submission flow.

## Artifact Slots

- `artifacts/`: successful DB row example, failed DB row example, response compatibility evidence.
- `references/`: synchronous persistence sequence and endpoint flow notes.
- `resources/`: test audio/curl references and provider failure matrix.
- `notes/`: compatibility decisions and failure-handling notes.
