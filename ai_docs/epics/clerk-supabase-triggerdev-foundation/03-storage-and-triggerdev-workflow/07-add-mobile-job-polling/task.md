# Task 07: Add Mobile Job Polling

## Type

UI

## Context

Once async submission exists, the mobile app must show queued/running/succeeded/failed states and poll the job endpoint for results.

## Implementation

- Update mobile submission to call `POST /v1/translations`.
- Poll `GET /v1/translations/:id`.
- Show queued, running, succeeded, and failed states.
- Preserve a temporary compatibility path if needed.

## Acceptance Criteria

- Mobile shows progress states for async jobs.
- Completed results render in the existing translation UI shape.
- Failed jobs show a user-safe error.

## Dependencies

- Depends On: dispatch-triggerdev-from-api

## Technical Notes

- Use existing Clerk token retrieval.
- Avoid direct Supabase bucket access from mobile.

## Artifact Slots

- `artifacts/`: screenshots of each job state.
- `references/`: mobile API contract notes.
- `resources/`: mock job responses.
- `notes/`: polling interval and UX decisions.
