# Task 02: Run Trigger Development Worker

## Type

Infrastructure

## Context

The app can already create queued translation jobs, but this account does not include paid Trigger.dev Staging/Preview environments. This task keeps the worker in Trigger.dev Development by running `trigger.dev dev` locally and proving the existing `translate-audio-job` can claim jobs without a cloud staging deploy.

## Implementation

- Re-read `trigger.config.mjs`, `trigger/translate-audio-job.mjs`, `package.json`, and the env checklist from Task 01 before deploying.
- Run `npm run trigger:dev -- --env-file .env.local --skip-update-check` from the repo root after Trigger auth/env blockers are cleared.
- Confirm the connected development worker includes task id `translate-audio-job`, uses `trigger.config.mjs`, and targets the project ref in `TRIGGER_PROJECT_REF`.
- Save only sanitized local-worker connection evidence in this task folder; do not deploy staging or production unless explicitly requested by the user.

## Acceptance Criteria

- [ ] `npm run trigger:dev -- --env-file .env.local --skip-update-check` connects, or a precise sanitized auth/config blocker is recorded.
- [ ] Worker evidence confirms `translate-audio-job` is registered in the Development environment.
- [ ] Evidence identifies the intended Trigger project/environment without exposing secret values.
- [ ] No paid Trigger.dev Staging/Preview deploy is attempted.
- [ ] Production deploy command/path remains documented as future work.

## Dependencies

- Depends On: `configure-trigger-environments`
- Blocks: `verify-trigger-claims-real-job`

## Technical Notes

- The local worker command should use `trigger.dev dev --config trigger.config.mjs`; keep any script change minimal and update task references if it changes.
- The Trigger task is intentionally thin: `trigger/translate-audio-job.mjs` logs job/run metadata and delegates provider orchestration to `server/translation-pipeline.mjs`.
- `trigger/AGENTS.md` requires stable task identifiers and logs that include `jobId`, Trigger `runId`, and attempt number.
- Worker connection output is execution evidence; capture IDs, task names, and environment labels, but redact secret-like values.

## Artifact Slots

- `artifacts/development-worker-evidence-template.md`: template for sanitized local-worker output, task list, and blocker details.
- `references/development-worker-source-map.md`: local files and scripts that define the worker bundle.
- `resources/development-worker-commands.md`: development worker and future production command checklist.
- `notes/development-worker-blockers.md`: Trigger account, CLI, or environment blockers discovered during execution.
