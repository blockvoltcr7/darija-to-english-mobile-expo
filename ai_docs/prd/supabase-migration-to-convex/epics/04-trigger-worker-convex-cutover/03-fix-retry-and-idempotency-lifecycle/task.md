# Task 03: Fix Retry And Idempotency Lifecycle

## Type

Code

## Context

The current Trigger retry path can be weakened if a retryable provider failure marks the job permanently failed before Trigger retries. Convex should model retryable and final failures explicitly.

## Implementation

- Add `attemptCount`, `maxAttempts`, `nextAttemptAt`, and `lockExpiresAt`.
- Add `retrying` status for retryable failures.
- Preserve Trigger idempotency key based on public job ID.
- Add stale lock recovery rules.
- Ensure terminal failures are written only after retry budget is exhausted.

## Acceptance Criteria

- Retryable provider errors do not immediately become terminal failures.
- Duplicate submit/dispatch is idempotent.
- Stale running jobs can be repaired.
- Final failure stores safe error details.

## Dependencies

- `port-provider-run-and-result-writes`

## Validation Commands

```bash
npx convex dev
npm run trigger:dev
npm run typecheck
```

## Artifact Slots

- `artifacts/`: retry state matrix.
- `notes/`: stale lock timeout decision.

