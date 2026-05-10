# Task 08: Verify Async Job Flow

## Type

Code

## Context

Epic 03 is complete only when storage, dispatch, worker processing, and mobile/history retrieval work together.

## Implementation

- Submit an authenticated async translation request.
- Confirm storage object exists and job is queued.
- Confirm Trigger.dev runs and transitions job status.
- Confirm result is visible through history/detail endpoint.

## Acceptance Criteria

- Job transitions through queued/running/succeeded or failed.
- Storage metadata and object exist.
- Result is visible through authenticated history endpoint.
- Failed jobs produce durable safe error records.

## Dependencies

- Depends On: add-mobile-job-polling

## Technical Notes

- Record evidence in `artifacts/`.
- Include both success and provider-failure scenarios if feasible.

## Artifact Slots

- `artifacts/`: end-to-end logs, screenshots, DB rows, Trigger.dev run output.
- `references/`: async QA checklist.
- `resources/`: test commands.
- `notes/`: QA findings and blockers.
