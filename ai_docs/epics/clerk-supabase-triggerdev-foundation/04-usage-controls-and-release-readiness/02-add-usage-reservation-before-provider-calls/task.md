# Task 02: Add Usage Reservation Before Provider Calls

## Type

Code

## Context

Provider calls cost money. The server/worker must reserve usage before OpenAI, Modal, or Trigger.dev provider execution.

## Implementation

- Add usage checks before provider calls.
- Reserve estimated usage before execution.
- Finalize actual usage on success.
- Release or adjust reservations on failure.

## Acceptance Criteria

- Over-limit users are rejected before paid provider calls.
- Failed jobs release or adjust reservations.
- Usage ledger records reservation and finalization events.

## Dependencies

- Depends On: create-usage-ledger-schema

## Technical Notes

- Use conservative estimates when duration is unknown.
- Keep user-facing errors safe and non-sensitive.

## Artifact Slots

- `artifacts/`: ledger event examples.
- `references/`: provider-cost control notes.
- `resources/`: over-limit test commands.
- `notes/`: allowance policy decisions.
