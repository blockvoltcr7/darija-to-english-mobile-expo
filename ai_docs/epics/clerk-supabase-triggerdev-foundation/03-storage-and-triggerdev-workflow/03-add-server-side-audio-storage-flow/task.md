# Task 03: Add Server-Side Audio Storage Flow

## Type

Code

## Context

The API currently receives base64 audio and sends it directly to providers. The server should store original audio in a private bucket before async processing.

## Implementation

- Validate upload size and MIME/filename metadata.
- Store original audio under the user/job key pattern.
- Write bucket/key metadata to the job row.
- Reject oversized files before provider calls.

## Acceptance Criteria

- Successful request stores original audio privately.
- Job row contains bucket and object key.
- Oversized files are rejected before provider calls.

## Dependencies

- Depends On: add-storage-metadata-to-jobs

## Technical Notes

- Keep mobile credentials out of bucket access.
- This may initially wrap the existing base64 upload shape.

## Artifact Slots

- `artifacts/`: storage object examples and request traces.
- `references/`: storage diagram and current upload flow.
- `resources/`: sample upload payloads.
- `notes/`: size/MIME decisions.
