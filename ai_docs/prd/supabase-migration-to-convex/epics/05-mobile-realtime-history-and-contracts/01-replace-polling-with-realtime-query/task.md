# Task 01: Replace Polling With Realtime Query

## Type

Code

## Context

The existing mobile client polls `GET /v1/translations/:id`. Convex can subscribe to job detail changes directly.

## Implementation

- Track `activeJobId` after submit.
- Use a Convex query for active job detail.
- Drive UI status from query result.
- Remove polling timeout logic from the new Convex path.
- Keep diagnostics for trace ID and state transitions.

## Acceptance Criteria

- Queued/running/succeeded/failed updates appear without REST polling.
- Terminal failures show safe error messages.
- The UI remains stable when the signed-in user changes.
- Existing record/upload buttons remain disabled during active work.

## Dependencies

- Epic 04 complete.

## Validation Commands

```bash
npm run typecheck
npm run lint
npx expo-doctor
```

## Artifact Slots

- `artifacts/`: realtime status QA notes.
- `notes/`: loading-state edge cases.

