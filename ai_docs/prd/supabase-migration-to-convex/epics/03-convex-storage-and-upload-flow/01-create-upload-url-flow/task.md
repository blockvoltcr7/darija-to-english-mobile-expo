# Task 01: Create Upload URL Flow

## Type

Code

## Context

Convex HTTP actions have a request size limit that makes base64 JSON upload a poor production path. The target flow is upload URL first, then job finalization with `storageId`.

## Implementation

- Add an authenticated mutation to create an upload URL.
- Add a mutation to create or finalize a translation job from `storageId`.
- Store filename, MIME type, byte size, trace ID, retention deadline, and upload status.
- Add `clientSubmissionId` for idempotency.

## Acceptance Criteria

- Mobile can request an upload URL only when signed in.
- Job creation never trusts client-supplied `clerkUserId`.
- Duplicate client submissions return or preserve the same job.
- Upload status supports `upload_pending`, `uploaded`, and `queued`.

## Dependencies

- Epic 02 complete.

## Validation Commands

```bash
npx convex dev
npm run typecheck
```

## Artifact Slots

- `artifacts/`: upload state transition notes.
- `references/`: Convex upload URL docs excerpts.

