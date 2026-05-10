# Task 02: Create Translation DB Writers

## Type

Code

## Context

The existing provider pipeline needs a small persistence layer before it can safely write jobs, provider runs, results, and failure states.

## Implementation

- Add server helpers to create translation jobs.
- Add helpers to write provider runs for OpenAI STT, Modal ASR, consolidation, and translation.
- Add helpers to write final results and mark jobs `succeeded` or `failed`.

## Acceptance Criteria

- DB writers are keyed by authenticated `clerk_user_id`.
- Writers support success and failure records.
- Writers avoid changing the mobile API response shape.

## Dependencies

- Depends On: create-translation-schema

## Technical Notes

- Keep provider-run writes resilient; a logging failure should be surfaced clearly.
- Do not move work to Trigger.dev in this task.

## Artifact Slots

- `artifacts/`: helper examples and DB write traces.
- `references/`: existing provider pipeline notes.
- `resources/`: sample result payloads.
- `notes/`: writer API decisions.
