# Task 01: Build iOS Preview

## Type

Infrastructure

## Context

The app must be installed on a physical iPhone before public release. EAS preview builds provide the fastest owner-device path once profiles and environment values are ready.

## Implementation

- Confirm `eas.json` preview profile exists.
- Confirm EAS preview env points at the staging HTTPS API.
- Confirm iOS identifier in `app.json` is final for preview.
- Run:
  - `npx eas-cli@latest build -p ios --profile preview`
- If Apple device registration or credentials block the build, capture exact next steps.
- Save build URL or build ID when available.

## Acceptance Criteria

- iOS preview build succeeds, or credential/device registration blocker is documented.
- Build uses the preview profile.
- Build evidence includes EAS build ID or URL.
- No backend or provider secrets are embedded in the build.

## Dependencies

- Depends On: 00-eas-project-and-build-profiles/verify-eas-config
- Depends On: 02-eas-environments-and-config-safety/add-non-local-api-diagnostics

## Technical Notes

- This may require Apple Developer access and device registration.
- Do not switch to production profile for owner-device QA.

## Artifact Slots

- `artifacts/`: EAS build output, build URL, blocker evidence.
- `references/`: preview profile excerpt.
- `resources/`: build command.
- `notes/`: Apple credential or UDID setup notes.

