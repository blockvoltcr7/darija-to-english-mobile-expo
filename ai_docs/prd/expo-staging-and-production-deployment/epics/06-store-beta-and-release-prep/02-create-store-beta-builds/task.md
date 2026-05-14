# Task 02: Create Store Beta Builds

## Type

Infrastructure

## Context

Store beta builds are closer to production than internal preview installs. This task creates TestFlight and/or Google Play testing builds after staging E2E succeeds.

## Implementation

- Build iOS staging profile for TestFlight when Apple setup is ready.
- Build Android staging/production-like test profile when Google Play setup is ready.
- Submit builds through EAS Submit if configured.
- Verify build environment targets the intended staging or production API.
- For the current Expo plan, remember that the `staging` build profile uses EAS `preview` env values; verify the API target via app diagnostics.
- Capture build IDs and store beta status.

## Acceptance Criteria

- TestFlight or Google Play testing build is created when credentials are available.
- Build target API URL is documented.
- Store beta status is captured.
- Any missing store account setup is documented as a blocker, not treated as success.

## Dependencies

- Depends On: configure-eas-submit

## Technical Notes

- Store beta should not bypass staging E2E evidence.
- If production API is not ready, staging store beta should explicitly target staging API.
- Do not assume an EAS environment named `staging` exists unless the Expo account has been upgraded and `eas.json` has been changed back.

## Artifact Slots

- `artifacts/`: EAS build/submit IDs and store beta screenshots.
- `references/`: build profile and submit profile excerpts.
- `resources/`: build/submit commands.
- `notes/`: store-review or account blockers.
