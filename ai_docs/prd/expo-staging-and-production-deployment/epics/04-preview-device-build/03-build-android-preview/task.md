# Task 03: Build Android Preview

## Type

Infrastructure

## Context

Android release readiness should be tracked separately so iOS development-device QA can proceed without hiding Android gaps. This task creates an Android preview or development build when Android is in active scope.

## Implementation

- Confirm Android package identifier in `app.json`.
- Confirm preview or development env values apply to Android builds.
- Confirm this task does not depend on a custom paid EAS environment; default EAS environments available on the account are `development`, `preview`, and `production`.
- Run:
  - `npx eas-cli@latest build -p android --profile preview`
- If a development-client Android build is the desired path, document the switch to:
  - `npx eas-cli@latest build -p android --profile development`
- Capture build ID or record why Android is deferred.
- Do not block iOS development QA if the user explicitly scopes Android later.

## Acceptance Criteria

- Android preview build succeeds or is explicitly deferred with rationale.
- Android build uses preview or development env values.
- Build evidence or blocker notes are captured.

## Dependencies

- Depends On: 00-eas-project-and-build-profiles/verify-eas-config
- Depends On: 02-eas-environments-and-config-safety/add-non-local-api-diagnostics

## Technical Notes

- Android emulator local API default is `http://10.0.2.2:8787`; physical-device preview/development builds should use the development HTTPS API.
- The EAS environment name may be `preview` or `development`; the app diagnostics are the source of truth for the API target.
- If Play Store setup is missing, internal APK/AAB preview evidence may still be useful.

## Artifact Slots

- `artifacts/`: EAS Android build output or deferral note.
- `references/`: Android profile/package excerpts.
- `resources/`: Android build command.
- `notes/`: Android release-scope decisions.
