# Task 03: Verify Trigger Claims Real Job

## Type

Code

## Context

The development-only scope still needs real proof that an API-created job is claimed by the Trigger.dev Development worker and reaches a terminal status the mobile app can poll. This task proves the current development path from Clerk-authenticated API request through Supabase Storage, local Trigger.dev worker, OpenAI, Modal Darija ASR, and persisted translation results.

## Implementation

- Use the API path selected in Task 01, either local API for simulator QA or the hosted Cloud Run API if it dispatches to the same Trigger.dev Development environment.
- Create a Clerk-authenticated `POST /v1/translations` request matching `server/AGENTS.md` and `lib/api.ts`; capture `jobId`, `triggerRunId`, and `detailUrl`.
- Poll `GET /v1/translations/:id` until `succeeded` or `failed`, refreshing Clerk session tokens if using mobile/client tooling.
- Cross-check Trigger logs for `translate-audio-job`, stored-job claim, audio download, provider completion, consolidation, translation, and final status.
- If the run fails, classify the failure owner: API, Trigger, Supabase, Modal, OpenAI, auth, fixture, or body-size limit.

## Acceptance Criteria

- [ ] A real development-runtime API request returns `202`, `jobId`, `triggerRunId`, `status: queued`, and `detailUrl`.
- [ ] Trigger Development logs show the local worker claimed the same job ID and run ID.
- [ ] API polling reaches `succeeded` with English translation, consolidated Darija, raw OpenAI transcript, raw Darija transcript, and model metadata, or records a precise owner for failure.
- [ ] Sanitized evidence includes API URL, build/runtime context, job ID, Trigger run ID, terminal status, and timestamps.
- [ ] No Clerk session token, API key, private audio content, or full transcript is committed.

## Dependencies

- Depends On: `deploy-trigger-staging-worker`
- Blocks: `document-trigger-operations`
- Blocks: `05-staging-e2e-qa/upload-phone-audio-fixture`

## Technical Notes

- `server/index.mjs` dispatches `translateAudioJob.trigger({ job_id: jobId }, { idempotencyKey: ... })` and persists the returned run ID through `updateTranslationJobTriggerRunId`.
- `server/translations.mjs` stores `trigger_run_id`, job status, provider runs, and translation results used by `GET /v1/translations/:id`.
- `lib/api.ts` already normalizes queued and polling responses and preserves `triggerRunId` for diagnostics.
- This task may call paid providers; confirm user approval and use a short, non-sensitive fixture.

## Artifact Slots

- `artifacts/staging-job-evidence-template.md`: sanitized structure for API response, polling timeline, Trigger run, and final status.
- `references/api-trigger-contract.md`: local API/worker contract excerpts for job creation and polling.
- `resources/staging-job-test-commands.md`: curl/client test recipe with token placeholders.
- `notes/failure-classification.md`: task-specific failure taxonomy and remediation notes.
