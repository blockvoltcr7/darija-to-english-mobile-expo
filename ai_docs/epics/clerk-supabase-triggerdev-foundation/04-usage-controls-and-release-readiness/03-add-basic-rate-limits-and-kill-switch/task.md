# Task 03: Add Basic Rate Limits And Kill Switch

## Type

Code

## Context

Quota checks are not enough for abuse and incident response. The API also needs request rate limits and a global provider kill switch.

## Implementation

- Add basic rate limits by Clerk user ID and IP address.
- Add a global provider execution kill switch.
- Ensure limits block before paid provider calls.

## Acceptance Criteria

- Abuse path is blocked before OpenAI, Modal, or Trigger.dev provider work.
- Kill switch can prevent provider execution.
- Error responses are safe and clear.

## Dependencies

- Depends On: add-usage-reservation-before-provider-calls

## Technical Notes

- Keep the first implementation simple and server-owned.
- Document any env var used for kill switch behavior.

## Artifact Slots

- `artifacts/`: rate-limit and kill-switch test output.
- `references/`: cost-control architecture notes.
- `resources/`: test commands.
- `notes/`: threshold decisions.
