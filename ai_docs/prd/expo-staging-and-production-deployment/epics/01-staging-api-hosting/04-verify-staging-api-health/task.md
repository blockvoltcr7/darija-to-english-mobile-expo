# Task 04: Verify Staging API Health

## Type

Code

## Context

The staging API must be reachable over HTTPS before any device build points at it. `/health` is the least expensive way to verify deployment, configuration, and model metadata shape.

## Implementation

- Deploy the API using the selected host workflow.
- Run:
  - `curl https://<staging-api>/health`
- Confirm response shape includes:
  - `ok`
  - `service`
  - `dependencies`
  - `models.openai_transcription`
  - `models.consolidation`
  - `models.translation`
- Confirm staging logs show the request.
- Confirm no provider call is made by health check.

## Acceptance Criteria

- HTTPS `/health` returns `ok: true` or a clear dependency status with expected shape.
- Health response model metadata matches current server config.
- API logs are accessible for the health request.
- Any failed dependency is documented with owner and next action.

## Dependencies

- Depends On: add-api-host-deployment-config
- Depends On: configure-staging-api-environment

## Technical Notes

- Do not run paid translation calls in this task unless health is already passing.
- If the host rewrites paths or blocks large bodies, note it for later E2E tasks.

## Artifact Slots

- `artifacts/`: sanitized `curl` output and host log excerpt.
- `references/`: expected health contract.
- `resources/`: health-check command.
- `notes/`: deployment failures or dependency issues.

