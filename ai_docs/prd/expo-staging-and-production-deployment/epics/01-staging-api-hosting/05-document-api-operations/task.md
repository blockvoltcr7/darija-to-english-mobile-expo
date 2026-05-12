# Task 05: Document API Operations

## Type

Code

## Context

Future QA and release work needs exact operational guidance for deploying, checking logs, rolling back, and distinguishing API failures from Trigger or provider failures.

## Implementation

- Create or update `ai_docs/deployment/api-hosting.md`.
- Document:
  - selected host.
  - deployment command.
  - staging API URL.
  - required env vars by name only.
  - health check command.
  - log access path.
  - rollback/redeploy procedure.
  - known request-size and runtime constraints.
- Link this doc from `ai_docs/deployment/README.md` if that file exists or is created by this epic package.

## Acceptance Criteria

- API operations doc exists.
- A future executor can deploy, verify, inspect logs, and roll back from docs.
- Docs do not reveal secrets.
- Docs clearly state the API deploy is separate from Expo native builds.

## Dependencies

- Depends On: verify-staging-api-health

## Technical Notes

- Keep operational docs concise and command-oriented.
- Production API can be described as deferred if not yet deployed.

## Artifact Slots

- `artifacts/`: doc review checklist.
- `references/`: host docs and PRD API contract.
- `resources/`: copied command list.
- `notes/`: operational assumptions and gaps.

