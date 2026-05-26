# Deploy Production Trigger Worker

## Type

Infrastructure

## Context

The TestFlight/staging path has already shown that jobs can stay queued when the local Trigger.dev Development worker is disconnected. PRD Phase 3 and the high-risk table require production jobs to execute without `trigger dev`, with sanitized evidence that the production worker can run the stored-audio pipeline.

## Implementation

- Deploy the Trigger task defined by `trigger/translate-audio-job.mjs` using `npm run trigger:deploy:prod` only after production API, Trigger project/environment, and secrets are approved.
- Confirm `trigger.config.mjs` uses the intended `TRIGGER_PROJECT_REF`, `dirs: ['./trigger']`, retry policy, and 900-second max duration.
- Confirm the production API dispatches jobs with the same Trigger project/environment and records `translation_jobs.trigger_run_id` through `server/index.mjs` and `server/translations.mjs`.
- Capture `artifacts/production-trigger-deployment-summary.md` with deployment identity, task id, safe run IDs/statuses, and whether storage download, provider calls, translation, and optional TTS reached final status.

## Acceptance Criteria

- [ ] Production Trigger deployment exists for task id `translate-audio-job`.
- [ ] A production job can leave `queued` without a local `npm run trigger:dev` process.
- [ ] Evidence correlates API `jobId`, `triggerRunId`, task start, stored-audio download, OpenAI STT, Modal ASR, consolidation, translation, optional TTS, and terminal job status using safe IDs/statuses only.
- [ ] API and worker environment names/project refs are confirmed to match.
- [ ] Trigger secrets, `.env` values, private audio, full transcripts, and generated audio bytes are not recorded.

## Dependencies

- Depends On: `deploy-production-cloud-run-api`
- Depends On: `decide-production-resource-isolation`
- Blocks: `configure-production-auth-storage-and-providers`
- Blocks: `run-production-smoke-test`

## Technical Notes

- `ai_docs/deployment/triggerdev.md` documents Development as the current included QA runtime and production deployment as future; update that runbook only with verified production facts.
- `trigger/translate-audio-job.mjs` should remain thin; provider orchestration stays in `server/translation-pipeline.mjs`.
- The existing polling and diagnostics path depends on `triggerRunId` flowing from `server/index.mjs` to `lib/api.ts` and `app/translate.tsx`.
- If TTS is enabled, TTS failure must remain non-blocking for text success, matching the current pipeline contract.

## Artifact Slots

- `artifacts/production-trigger-deployment-summary.md`: sanitized deployment/run evidence.
- `references/source-anchors.md`: Trigger config, job, API dispatch, and runbook anchors.
- `resources/production-trigger-checklist.md`: deploy, correlation, and no-local-worker verification checklist.
- `notes/trigger-runtime-blockers.md`: account, plan, project-ref, secret, or environment mismatches.
