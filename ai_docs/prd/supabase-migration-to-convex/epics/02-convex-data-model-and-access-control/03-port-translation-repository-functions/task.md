# Task 03: Port Translation Repository Functions

## Type

Code

## Context

The server currently owns translation job creation, status updates, result writes, provider audit rows, list, and detail operations. These repository functions should move to Convex before storage or worker cutover.

## Implementation

- Implement create job, update storage metadata, update trigger run ID, claim job, mark running, mark succeeded, mark failed, record provider run, write result, list history, and get detail.
- Preserve external `publicJobId` compatibility.
- Use internal mutations for worker-only writes.
- Use auth-scoped queries for user-facing history.

## Acceptance Criteria

- Server can create and update jobs through Convex.
- History list returns only the authenticated user's jobs.
- Detail lookup cannot leak another user's result.
- Provider run metadata is sanitized.

## Dependencies

- `define-convex-schema`

## Validation Commands

```bash
npx convex dev
npm run typecheck
npm run lint
```

## Artifact Slots

- `artifacts/`: repository parity checklist.
- `references/`: old Supabase repository function list.

