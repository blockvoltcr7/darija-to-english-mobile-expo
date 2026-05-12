# Task 03: Document Production API Path

## Type

Infrastructure

## Context

Production release requires a clear API deployment path even if production deployment is deferred. This prevents mobile production builds from being created without a stable backend target.

## Implementation

- Extend `ai_docs/deployment/api-hosting.md` or create `ai_docs/deployment/production-api.md`.
- Document:
  - production API host plan.
  - production env variables by name only.
  - health check URL pattern.
  - Trigger production deployment dependency.
  - promotion path from staging.
  - rollback path.
- State whether staging and production share any infrastructure and the risks of doing so.

## Acceptance Criteria

- Production API deployment path is documented.
- Production mobile build cannot be considered ready without a production API URL decision.
- Docs preserve server-side secret boundaries.
- Shared-resource risks are explicit.

## Dependencies

- Depends On: 01-staging-api-hosting/document-api-operations

## Technical Notes

- This task can document a deferred production deploy; it does not have to deploy production.
- Keep environment and data-isolation decisions visible.

## Artifact Slots

- `artifacts/`: production API plan review notes.
- `references/`: staging API ops doc and PRD decision table.
- `resources/`: production health/deploy command placeholders.
- `notes/`: production resource decisions.

