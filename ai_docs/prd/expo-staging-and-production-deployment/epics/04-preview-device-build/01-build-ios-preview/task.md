# Task 01: Build iOS Preview

## Type

Infrastructure

## Context

The app must be installed on a physical iPhone before public release. EAS preview builds provide the fastest owner-device path once profiles and environment values are ready. EAS development-client builds are also valid for device QA when we need the default `development` environment instead of the default `preview` environment.

## Implementation

- Confirm `eas.json` preview profile exists.
- Confirm EAS preview or development env points at the development HTTPS API.
- Confirm this epic does not depend on a custom paid EAS environment; default EAS environments available on the account are `development`, `preview`, and `production`.
- Confirm iOS identifier in `app.json` is final for preview.
- Run:
  - `npx eas-cli@latest build -p ios --profile preview`
- If the preview profile is not the desired path for this account, document the switch to:
  - `npx eas-cli@latest build -p ios --profile development`
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
- Verify the active API target in the app diagnostics instead of relying only on EAS environment names.
- Use the EAS `development` profile when the goal is an installed development-client build; use the EAS `preview` profile when the goal is an internal preview binary.

## Artifact Slots

- `artifacts/`: EAS build output, build URL, blocker evidence.
- `references/`: preview/development profile excerpt.
- `resources/`: build command.
- `notes/`: Apple credential or UDID setup notes.
