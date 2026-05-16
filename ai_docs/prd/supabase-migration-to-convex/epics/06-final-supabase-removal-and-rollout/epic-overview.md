# Epic 06: Final Supabase Removal And Rollout

## Objective

Finish the migration by deciding historical data handling, removing Supabase dependencies and docs, updating operational guidance, and completing release-readiness QA.

## Scope

- Decide backfill vs retention bridge.
- Remove Supabase packages/env/code.
- Update AGENTS, README, and runbooks.
- Run final fresh-user and regression QA.

## Out Of Scope

- Replacing Clerk.
- Replacing Trigger.dev unless a later approved epic does so.
- Public release without QA evidence.

## Tasks

| # | Task | Type | Depends On |
| --- | --- | --- | --- |
| 01 | `backfill-or-retention-decision` | Planning | Epic 05 |
| 02 | `remove-supabase-dependencies-and-env` | Code | `backfill-or-retention-decision` |
| 03 | `update-agent-docs-and-runbooks` | Docs | `remove-supabase-dependencies-and-env` |
| 04 | `run-release-readiness-qa` | QA | `update-agent-docs-and-runbooks` |

## Verification

- Supabase references are removed or explicitly marked historical.
- Convex E2E is green.
- Fresh-user QA passes.
- Rollback branch/tag is documented.

