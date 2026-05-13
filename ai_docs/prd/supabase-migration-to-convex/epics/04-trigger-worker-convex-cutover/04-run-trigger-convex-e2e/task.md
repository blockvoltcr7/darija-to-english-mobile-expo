# Task 04: Run Trigger Convex E2E

## Type

QA

## Context

Before mobile realtime cutover, the backend must prove an uploaded Convex audio object can move through Trigger, providers, Convex result writes, and history detail.

## Implementation

- Start API, Convex dev, and Trigger dev.
- Submit a non-sensitive audio fixture.
- Verify job transitions from queued to running to succeeded.
- Verify provider runs and result rows exist in Convex.
- Verify history/detail endpoint or query returns the expected result shape.

## Acceptance Criteria

- End-to-end job succeeds without Supabase writes.
- Trigger run ID or worker execution ID is linked to the job.
- Provider run count and final result are correct.
- Failure evidence does not include secrets, tokens, or private audio.

## Dependencies

- `fix-retry-and-idempotency-lifecycle`

## Validation Commands

```bash
npx convex dev
npm run api
npm run trigger:dev
curl http://localhost:8787/health
```

## Artifact Slots

- `artifacts/`: sanitized E2E run summary.
- `notes/`: provider/runtime blockers.

