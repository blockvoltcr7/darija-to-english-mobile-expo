# Task 07: Verify Cost Control Paths

## Type

Code

## Context

Cost controls are only useful if over-limit requests and kill-switch paths block before paid provider execution.

## Implementation

- Test over-limit behavior.
- Test rate limiting.
- Test global kill switch.
- Test retention cleanup targeting expired objects.

## Acceptance Criteria

- Over-limit users are blocked before provider calls.
- Kill switch blocks provider execution.
- Expired storage objects can be cleaned up.
- Evidence is captured for the beta readiness record.

## Dependencies

- Depends On: add-basic-rate-limits-and-kill-switch
- Depends On: add-legal-and-beta-docs

## Technical Notes

- Use safe test users and placeholder data.
- Capture command output in `artifacts/`.

## Artifact Slots

- `artifacts/`: cost-control test output and cleanup evidence.
- `references/`: beta readiness checklist.
- `resources/`: test commands and sample payloads.
- `notes/`: QA findings and blockers.
