# Task 04: Verify Translation Result Sections

## Type

Code

## Context

The E2E job is only successful when the app displays the final translated result and supporting transcripts/metadata, not merely when a backend job finishes.

## Implementation

- Poll in-app until the uploaded job reaches `succeeded` or `failed`.
- Confirm visible result sections:
  - English translation.
  - Consolidated Darija.
  - OpenAI transcript.
  - Darija model transcript.
  - Model metadata.
- Confirm Trigger run succeeded.
- Confirm API detail endpoint returns the final result for the current user.
- Capture failure details if any section is missing or stale.

## Acceptance Criteria

- App reaches `Complete` or equivalent successful terminal state.
- English translation is visible.
- Consolidated Darija is visible.
- Raw OpenAI and Darija model transcript outputs are available.
- Model metadata is visible or reachable in the expected UI surface.

## Dependencies

- Depends On: upload-phone-audio-fixture

## Technical Notes

- A backend success without visible app result is not enough.
- A provider warning in logs may be acceptable only if final transcript/translation are correct and warnings are documented.

## Artifact Slots

- `artifacts/`: result screenshots and sanitized final API detail.
- `references/`: expected response shape.
- `resources/`: polling/result verification checklist.
- `notes/`: missing-section findings or UI issues.

