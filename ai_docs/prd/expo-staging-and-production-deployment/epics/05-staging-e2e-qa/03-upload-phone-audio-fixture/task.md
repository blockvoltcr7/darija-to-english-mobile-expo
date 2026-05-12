# Task 03: Upload Phone Audio Fixture

## Type

Code

## Context

The central staging proof is uploading real audio from a physical phone and confirming the app creates a queued translation job against the staging API.

## Implementation

- Ensure the test audio fixture is available on the physical iPhone.
- Use the app upload flow to select the audio file.
- Confirm the app sends `POST /v1/translations` to the staging API.
- Capture returned `jobId`, `triggerRunId`, and initial `queued` status.
- Monitor app diagnostics and API logs for upload size, MIME type, authenticated user, and queue response.
- Stop if the app points at a local API URL.

## Acceptance Criteria

- Phone upload succeeds and returns a queued translation job.
- `jobId` and `triggerRunId` are captured.
- API logs show the fresh Clerk user and expected filename/MIME metadata.
- Upload errors are tied to API, auth, file picker, request size, or network cause.

## Dependencies

- Depends On: verify-history-isolation
- Depends On: 03-triggerdev-staging-runtime/verify-trigger-claims-real-job

## Technical Notes

- Use the known `.m4a` fixture unless QA defines a new fixture.
- This task may incur provider costs once the worker runs.

## Artifact Slots

- `artifacts/`: upload screenshot, job ID, Trigger run ID, sanitized API log.
- `references/`: upload API contract and fixture notes.
- `resources/`: audio fixture handling steps.
- `notes/`: upload/network/provider blockers.

