# Task 04: Document Trigger Operations

## Type

Code

## Context

After the staging worker is deployed and verified, future QA sessions need a durable runbook for deploying Trigger.dev, diagnosing queued jobs, and correlating app/API/Trigger evidence without re-reading the implementation. This task completes the PRD runbook requirement under `ai_docs/deployment/` and preserves the difference between local `trigger.dev dev` and the deployed staging runtime.

## Implementation

- Create or update `ai_docs/deployment/triggerdev.md` using the verified behavior from Tasks 01-03.
- Document staging deploy, production deploy path, required env vars by name, and the exact source files that define the worker: `trigger.config.mjs`, `trigger/translate-audio-job.mjs`, `server/index.mjs`, and `server/translation-pipeline.mjs`.
- Include a correlation guide from mobile diagnostics to API logs to Trigger dashboard using `jobId`, `translationJobId`, `triggerRunId`, and `traceId`.
- Add troubleshooting for stuck `queued`, missing run ID, already-claimed jobs, provider failures, auth failures, and staging API/worker environment drift.

## Acceptance Criteria

- [ ] `ai_docs/deployment/triggerdev.md` exists or is updated with staging and production deploy paths.
- [ ] The runbook explains local dev worker versus deployed staging worker.
- [ ] The runbook includes run ID and job ID correlation guidance grounded in the verified API/Trigger contract.
- [ ] The runbook includes operational checks for queued jobs and provider failures.
- [ ] The runbook avoids secrets, private audio content, full transcripts, and unverified execution claims.

## Dependencies

- Depends On: `verify-trigger-claims-real-job`
- Blocks: `05-staging-e2e-qa/upload-phone-audio-fixture`

## Technical Notes

- Prior local QA showed the symptom to document: API creates a queued job, but no worker claims it when only local `trigger.dev dev` was used and a deployed staging worker was absent.
- `app/AGENTS.md` and `lib/AGENTS.md` expect diagnostics to preserve queued job ID and Trigger run ID for device testing.
- `ai_docs/deployment/api-hosting.md` already documents Cloud Run staging URL and API secret ownership; link to it instead of duplicating Cloud Run instructions.
- Keep any actual run IDs in evidence artifacts, not in generic runbook examples unless they are explicitly labeled as sanitized examples.

## Artifact Slots

- `artifacts/doc-review-template.md`: checklist for reviewing the operations runbook after verification.
- `references/operations-source-map.md`: source files and docs the runbook must align with.
- `resources/runbook-outline.md`: suggested sections for `ai_docs/deployment/triggerdev.md`.
- `notes/operations-decisions.md`: local-vs-staging runtime decisions and deferred production notes.
