# Epic 04: Trigger Worker Convex Cutover

## Objective

Keep Trigger.dev as the processing runtime while moving job claiming, provider audit rows, result writes, and final status to Convex.

## Scope

- Port worker claim logic.
- Port provider run and translation result writes.
- Fix retry and idempotency lifecycle.
- Run end-to-end Trigger + Convex QA.

## Out Of Scope

- Retiring Trigger.dev.
- Moving provider calls into Convex actions.
- Removing Supabase packages.

## Tasks

| # | Task | Type | Depends On |
| --- | --- | --- | --- |
| 01 | `port-worker-job-claiming` | Code | Epic 03 |
| 02 | `port-provider-run-and-result-writes` | Code | `port-worker-job-claiming` |
| 03 | `fix-retry-and-idempotency-lifecycle` | Code | `port-provider-run-and-result-writes` |
| 04 | `run-trigger-convex-e2e` | QA | `fix-retry-and-idempotency-lifecycle` |

## Verification

- Trigger receives Convex-backed jobs.
- Only one worker can claim a queued job.
- Results and provider runs persist in Convex.

