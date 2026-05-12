# Task 02: Install Preview On iPhone

## Type

Code

## Context

Building the app is not enough. The preview build must be installed and launched on the target physical iPhone so real-device networking and auth can be validated.

## Implementation

- Install the iOS preview build using the EAS install URL, QR flow, or TestFlight fallback if chosen.
- Launch the app on the iPhone.
- Confirm the app reaches the public landing or sign-in screen.
- Confirm no simulator-only assumptions are required.
- Capture install evidence without exposing private account details.

## Acceptance Criteria

- Preview build is installed on a physical iPhone.
- App launches successfully.
- User can reach auth entry.
- Install path and build ID are recorded for QA evidence.

## Dependencies

- Depends On: build-ios-preview

## Technical Notes

- Device networking is the reason this task exists; do not substitute iOS simulator evidence.
- If internal distribution blocks install, document whether TestFlight is the next path.

## Artifact Slots

- `artifacts/`: install screenshot, build ID, device QA notes.
- `references/`: EAS install instructions.
- `resources/`: install URL or QR handling notes, sanitized.
- `notes/`: device-specific blockers.

