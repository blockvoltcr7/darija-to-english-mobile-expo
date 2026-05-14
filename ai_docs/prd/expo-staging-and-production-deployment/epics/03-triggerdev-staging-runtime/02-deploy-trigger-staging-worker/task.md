# Task 02: Deploy Trigger Staging Worker

## Type

Infrastructure

## Context

The app can already create queued translation jobs through the hosted API, but staging still depends on a deployed Trigger.dev worker to process those jobs without `trigger.dev dev`. This task satisfies the PRD Trigger Runtime Contract by deploying the existing `translate-audio-job` task to the Trigger staging environment and proving the deployment target is not local-only.

## Implementation

- Re-read `trigger.config.mjs`, `trigger/translate-audio-job.mjs`, `package.json`, and the env checklist from Task 01 before deploying.
- Run `npm run trigger:deploy:staging` from the repo root after Trigger auth/env blockers are cleared.
- Confirm the deployment includes task id `translate-audio-job`, uses `trigger.config.mjs`, and targets the `staging` environment for the project ref in `TRIGGER_PROJECT_REF`.
- Save only sanitized deployment evidence in this task folder; do not deploy production unless explicitly requested by the user.

## Acceptance Criteria

- [ ] `npm run trigger:deploy:staging` succeeds, or a precise sanitized auth/config blocker is recorded.
- [ ] Deployment evidence confirms `translate-audio-job` is part of the deployed worker bundle.
- [ ] Deployment evidence identifies the intended Trigger project/environment without exposing secret values.
- [ ] Local `trigger.dev dev` is not required for staging jobs after deployment.
- [ ] Production deploy command/path remains documented but unexecuted.

## Dependencies

- Depends On: `configure-trigger-environments`
- Blocks: `verify-trigger-claims-real-job`

## Technical Notes

- The deploy script is a wrapper around `trigger.dev deploy --config trigger.config.mjs --env staging`; keep any script change minimal and update the task references if it changes.
- The Trigger task is intentionally thin: `trigger/translate-audio-job.mjs` logs job/run metadata and delegates provider orchestration to `server/translation-pipeline.mjs`.
- `trigger/AGENTS.md` requires stable task identifiers and logs that include `jobId`, Trigger `runId`, and attempt number.
- Deployment output is execution evidence; capture IDs, task names, and environment labels, but redact secret-like values.

## Artifact Slots

- `artifacts/deployment-evidence-template.md`: template for sanitized deploy output, task list, and blocker details.
- `references/deploy-source-map.md`: local files and scripts that define the deployment bundle.
- `resources/deploy-commands.md`: staging/prod deploy and verification command checklist.
- `notes/deployment-blockers.md`: Trigger account, CLI, or environment blockers discovered during execution.
