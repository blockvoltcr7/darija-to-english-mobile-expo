# Task 05: Add Trigger.dev Translation Task

## Type

Code

## Context

The provider pipeline currently lives inside the synchronous `handleTranslateAudio` flow in `server/index.mjs`: create job, mark running, run Modal/OpenAI, write provider runs/results, and mark success/failure. Epic 03 needs the same pipeline behind a Trigger.dev task so mobile requests can return quickly while Supabase remains the durable state store. The Trigger task payload must be small and non-sensitive: a job ID, not audio bytes, Clerk tokens, headers, or provider secrets.

## Implementation

- Extract reusable server-side provider orchestration from `server/index.mjs` into a worker-safe module such as `server/translation-pipeline.mjs`; avoid duplicating Modal/OpenAI/consolidation/translation logic.
- Add a Trigger.dev task under `trigger/` with stable ID `translate-audio-job` and payload schema `{ job_id: string }`.
- The task loads the job through `server/translations.mjs`, verifies status/storage metadata, claims or marks it `running`, downloads audio from Supabase Storage, calls the shared provider pipeline, writes provider runs/results, then marks `succeeded` or `failed`.
- Configure retry, queue/concurrency, max duration, and idempotency around `translation-job:<job_id>` to avoid duplicate paid provider calls.

## Acceptance Criteria

- [ ] Trigger.dev task `translate-audio-job` accepts only `{ job_id }` and no raw audio/auth payload.
- [ ] Worker reads audio from private Supabase Storage using server/worker credentials.
- [ ] Job transitions are durable: `queued` or claimable state to `running`, then `succeeded` or `failed`.
- [ ] Provider runs and final results use the existing Epic 02 repository conventions and sanitized metadata.
- [ ] Duplicate/retried executions are guarded so completed or actively claimed jobs do not repeat expensive provider calls.

## Dependencies

- Depends On: add-triggerdev-project-config
- Blocks: dispatch-triggerdev-from-api
- Blocks: add-mobile-job-polling
- Blocks: verify-async-job-flow

## Technical Notes

- Reuse constants from `server/translations.mjs`: `TRANSLATION_JOB_STATUS`, `PROVIDER_RUN_STATUS`, `PROVIDER_OPERATIONS`, and `PROVIDERS`.
- Existing sync route code in `server/index.mjs` is the behavioral reference, but this task should extract shared code rather than copy a second provider pipeline.
- Store safe error codes/messages only. Do not persist stack traces, bearer tokens, provider API keys, base64 audio, raw headers, or full Trigger payloads.
- Trigger.dev run ID is execution metadata; Supabase job status/result remains the app state.
- Reference visual: `ai_docs/visuals/clerk-supabase-triggerdev-foundation/04-triggerdev-event-workflow.png`.

## Artifact Slots

- `artifacts/`: task registration evidence, run logs, sample completed/failed job rows, and provider-run rows.
- `references/`: event workflow visual, Trigger task docs, and current provider pipeline notes.
- `resources/`: sample `{ job_id }` payloads, idempotency keys, and forced-failure cases.
- `notes/`: retry, queue/concurrency, idempotency, and job-claiming decisions.
