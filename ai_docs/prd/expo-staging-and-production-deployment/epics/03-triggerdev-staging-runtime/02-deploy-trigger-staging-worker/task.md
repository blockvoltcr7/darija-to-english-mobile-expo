# Task 02: Deploy Trigger Staging Worker

## Type

Infrastructure

## Context

Queued translations previously remained queued when the local worker was not connected. This task deploys the staging worker so jobs are processed outside the developer machine.

## Implementation

- Run or document:
  - `npm run trigger:deploy:staging`
- Capture sanitized deployment output.
- Confirm the deployed worker includes `translate-audio-job`.
- Confirm deployment targets the intended Trigger environment.
- Do not deploy production unless explicitly requested.

## Acceptance Criteria

- Staging Trigger worker deploys successfully or a precise auth/config blocker is recorded.
- The deployed worker includes the translation job task.
- Deployment evidence is saved without secrets.
- Local `trigger.dev dev` is no longer required for staging queued jobs.

## Dependencies

- Depends On: configure-trigger-environments

## Technical Notes

- Trigger CLI/auth may require user login.
- If scripts are missing or stale, update `package.json` only as needed and document the change.

## Artifact Slots

- `artifacts/`: sanitized deployment output.
- `references/`: Trigger script/config excerpts.
- `resources/`: deploy commands.
- `notes/`: Trigger account or environment blockers.

