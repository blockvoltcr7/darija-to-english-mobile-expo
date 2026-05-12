# Task 04: Verify Preview App Diagnostics

## Type

Code

## Context

Before E2E QA, the installed preview app must prove it is using the staging API and safe public config. This prevents false failures caused by local URLs on a physical phone.

## Implementation

- Open the installed preview app on the physical iPhone.
- Capture diagnostics showing:
  - active API base URL.
  - app build/profile where available.
  - Clerk publishable environment if safely visible.
- Confirm API URL is HTTPS and non-local.
- Confirm sign-in/sign-up entry is reachable.
- If the app shows `localhost`, stop and fix EAS env config before E2E QA.

## Acceptance Criteria

- Preview app diagnostics show a non-local HTTPS API URL.
- App can reach auth entry.
- Any local URL usage blocks E2E QA and is documented.
- Evidence is captured for the staging QA package.

## Dependencies

- Depends On: install-preview-on-iphone

## Technical Notes

- Do not include tokens or session IDs in screenshots.
- The diagnostic evidence should be safe to share internally.

## Artifact Slots

- `artifacts/`: phone screenshot and diagnostics note.
- `references/`: expected config matrix.
- `resources/`: verification checklist.
- `notes/`: config mismatches and fixes.

