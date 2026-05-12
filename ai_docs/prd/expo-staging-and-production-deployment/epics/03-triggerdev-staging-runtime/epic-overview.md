# Epic 03: Trigger.dev Staging Runtime

## Objective

Deploy and verify the async translation worker in Trigger.dev staging so queued jobs complete without a local `trigger.dev dev` process.

## Scope

- Configure Trigger.dev staging and production environment expectations.
- Deploy the staging worker.
- Trigger a real staging job through the API.
- Capture Trigger evidence and operations notes.

## Out Of Scope

- Rewriting the worker.
- Changing provider orchestration.
- Production Trigger cutover beyond documented commands.

## Tasks

| # | Task | Type | Depends On |
| --- | --- | --- | --- |
| 01 | `configure-trigger-environments` | Infrastructure | `01-staging-api-hosting/verify-staging-api-health` |
| 02 | `deploy-trigger-staging-worker` | Infrastructure | `configure-trigger-environments` |
| 03 | `verify-trigger-claims-real-job` | Code | `deploy-trigger-staging-worker` |
| 04 | `document-trigger-operations` | Code | `verify-trigger-claims-real-job` |

## Verification

- `npm run trigger:deploy:staging` or documented equivalent succeeds.
- A staging run reaches success for an uploaded job.
- Trigger run ID is visible from API/mobile QA evidence.

