# Task 03: Verify Trigger Claims Real Job

## Type

Code

## Context

Worker deployment is not enough; staging needs proof that an API-created job is claimed and processed by the deployed worker.

## Implementation

- Use the staging API to create a real translation job with a safe audio fixture.
- Confirm API response includes `jobId` and `triggerRunId`.
- Confirm Trigger dashboard/logs show the run dequeued and started by the deployed worker.
- Confirm the run reaches `succeeded` or captures a provider-specific failure with logs.
- Confirm the API job status updates from `queued` to a terminal state.

## Acceptance Criteria

- A real staging job is claimed by the deployed Trigger worker.
- Trigger run ID is captured.
- API polling shows a terminal status.
- If failure occurs, logs identify whether API, Trigger, Supabase, Modal, OpenAI, or audio fixture caused it.

## Dependencies

- Depends On: deploy-trigger-staging-worker

## Technical Notes

- Use the same or comparable `.m4a` fixture used in simulator QA.
- This task may call paid providers; run only with user-approved staging credentials.

## Artifact Slots

- `artifacts/`: job ID, Trigger run ID, sanitized run evidence, final status.
- `references/`: API and Trigger contract excerpts.
- `resources/`: curl commands or fixture instructions.
- `notes/`: provider failures and remediation notes.

