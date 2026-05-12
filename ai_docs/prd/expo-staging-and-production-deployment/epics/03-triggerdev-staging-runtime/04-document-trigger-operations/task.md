# Task 04: Document Trigger Operations

## Type

Code

## Context

Operators need to know how to deploy Trigger.dev, inspect stuck queued jobs, connect run IDs to app/API traces, and distinguish local dev from staging runtime.

## Implementation

- Create or update `ai_docs/deployment/triggerdev.md`.
- Document:
  - staging deploy command.
  - production deploy command/path.
  - required env vars by name only.
  - dashboard evidence to capture.
  - what it means when jobs stay `queued`.
  - how to correlate app diagnostics, API job ID, and Trigger run ID.
- Add a short troubleshooting section for common failure modes.

## Acceptance Criteria

- Trigger operations doc exists.
- It explains local dev worker versus deployed staging worker.
- It includes run ID correlation guidance.
- It avoids printing secrets.

## Dependencies

- Depends On: verify-trigger-claims-real-job

## Technical Notes

- Prior queued-job failures should be captured as a known symptom: API queues but no worker claims.
- Keep this doc practical for QA sessions.

## Artifact Slots

- `artifacts/`: doc review notes.
- `references/`: Trigger run evidence from staging.
- `resources/`: deploy and troubleshooting commands.
- `notes/`: operational decisions.

