# Task 03: Build Android Preview

## Type

Infrastructure

## Context

Android release readiness should be tracked separately so iOS staging can proceed without hiding Android gaps. This task creates an Android preview build when Android is in active scope.

## Implementation

- Confirm Android package identifier in `app.json`.
- Confirm preview env values apply to Android builds.
- Confirm staging-profile builds also use EAS `preview` env values until custom EAS environments are available.
- Run:
  - `npx eas-cli@latest build -p android --profile preview`
- Capture build ID or record why Android is deferred.
- Do not block iOS staging E2E if the user explicitly scopes Android later.

## Acceptance Criteria

- Android preview build succeeds or is explicitly deferred with rationale.
- Android build uses preview env values.
- Build evidence or blocker notes are captured.

## Dependencies

- Depends On: 00-eas-project-and-build-profiles/verify-eas-config
- Depends On: 02-eas-environments-and-config-safety/add-non-local-api-diagnostics

## Technical Notes

- Android emulator local API default is `http://10.0.2.2:8787`; preview builds should use HTTPS staging API.
- The EAS environment name may be `preview` while the API target is still the staging Cloud Run API.
- If Play Store setup is missing, internal APK/AAB preview evidence may still be useful.

## Artifact Slots

- `artifacts/`: EAS Android build output or deferral note.
- `references/`: Android profile/package excerpts.
- `resources/`: Android build command.
- `notes/`: Android release-scope decisions.
