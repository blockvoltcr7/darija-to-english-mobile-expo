# Task 03: Build Android Preview

## Type

Infrastructure

## Context

Android should be tracked separately so iOS development-device QA can proceed without hiding Android gaps. This task either creates an Android internal preview build or explicitly defers Android with rationale. It should not block iPhone install and diagnostics unless the user makes Android active for this phase.

## Implementation

- Confirm Android package in `app.json` is `com.samisabiridrissi.darijatoenglish`.
- Confirm `build.preview` in `eas.json` uses `distribution: "internal"`, `environment: "preview"`, and `channel: "preview"`.
- Confirm EAS auth with `npx eas-cli@latest whoami`; record login/`EXPO_TOKEN` blocker if missing.
- Confirm preview env has non-local HTTPS API URL and Clerk publishable key presence without printing key values.
- If Android is active, run `npx eas-cli@latest build -p android --profile preview`.
- Confirm the output is installable for internal testing; Android device/emulator install evidence should use an APK, not only an AAB.
- If Android is deferred, fill the artifact template with the deferral reason and next trigger.

## Acceptance Criteria

- [ ] Android scope is explicitly active or deferred in notes.
- [ ] Android package, preview profile, EAS environment, and channel are verified.
- [ ] If active, Android build succeeds with build ID or URL and installable artifact type.
- [ ] If deferred, rationale and next action are recorded without blocking iOS Task 02 or Task 04.
- [ ] Evidence records sanitized build metadata, API URL, package, artifact type, and blocker/deferral status.
- [ ] No credentials, Clerk key values, `.env` values, or public internal install links are committed.

## Dependencies

- Depends On: 00-eas-project-and-build-profiles/verify-eas-config
- Depends On: 02-eas-environments-and-config-safety/add-non-local-api-diagnostics

## Technical Notes

- Android emulator local API default is `http://10.0.2.2:8787`; physical-device preview/development builds should use the configured non-local HTTPS API URL.
- Current `preview` profile is internal distribution and should produce an installable APK for device/emulator checks; AAB-only evidence is not enough for direct install.
- `npx eas-cli@latest build:run -p android` can be used after a successful APK build when emulator/device install validation is desired.
- Internal build URLs are sensitive/shareable operational evidence and should not be pasted into public docs.

## Artifact Slots

- `references/android-preview-config.md`: package/profile/env evidence and official Expo doc links.
- `resources/android-preview-build-commands.md`: preflight, build, optional install, and deferral commands.
- `artifacts/android-preview-build-evidence-template.md`: sanitized Android build or deferral evidence.
- `notes/android-scope-decision.md`: active/deferred decision and rationale.
