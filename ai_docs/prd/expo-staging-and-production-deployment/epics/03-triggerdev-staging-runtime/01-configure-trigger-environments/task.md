# Task 01: Configure Trigger Environments

## Type

Infrastructure

## Context

The API can queue jobs, but a deployed Trigger.dev worker must claim and process them outside local development. Trigger staging/prod environment config must align with the deployed API and Supabase resources.

## Implementation

- Inspect current Trigger config and scripts.
- Configure or document Trigger.dev environment values for staging and production.
- Include required server-side secrets by name only:
  - Supabase URL and service-role access needed by the worker.
  - OpenAI API key.
  - Darija ASR URL/API key.
  - any Trigger project/environment identifiers.
- Confirm the worker points at the same staging Supabase resources as the staging API.
- Record missing Trigger authentication or project access as blockers.

## Acceptance Criteria

- Trigger staging environment requirements are documented and configured where access allows.
- Production Trigger deployment path is documented even if production deploy is deferred.
- Secrets are not committed.
- Staging API and Trigger worker target compatible resources.

## Dependencies

- Depends On: 01-staging-api-hosting/verify-staging-api-health

## Technical Notes

- Do not rely on `npx trigger.dev dev` for staging QA.
- Keep resource sharing decisions explicit if staging uses current Supabase project.

## Artifact Slots

- `artifacts/`: sanitized Trigger env checklist.
- `references/`: current Trigger config and task excerpts.
- `resources/`: Trigger env commands.
- `notes/`: project/environment decisions and blockers.

