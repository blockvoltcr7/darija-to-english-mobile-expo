# Task 03: Document Native Identity Assumptions

## Type

Code

## Context

PRD `04-architecture-plan.md` lists deployment runbooks as required artifacts, and PRD `08-definition-of-done.md` requires EAS association plus installable preview/beta builds. Those builds depend on stable native identity. This task documents the current `app.json` identity and account assumptions so future EAS, Apple, and Google work does not accidentally rename or fork the app.

## Implementation

- Create or update `ai_docs/deployment/README.md` with an "App identity" section.
- Record current `app.json` values: `expo.name`, `expo.slug`, `expo.version`, `expo.scheme`, `ios.bundleIdentifier`, `ios.appleTeamId`, `ios.supportsTablet`, and `android.package`.
- State that current source has no `owner` or `runtimeVersion` field unless added by a later task.
- Document Apple Developer assumptions separately from source config: team `57JWLP426D`, internal distribution device registration, and later TestFlight path.
- Document Google Play assumptions separately: package name ownership and later internal testing track.
- Cross-link this identity note from the Epic 00 task artifacts or future deployment docs as needed.

## Acceptance Criteria

- [ ] Deployment docs record current iOS bundle ID, Apple Team ID, Android package, app name, slug, scheme, and version.
- [ ] Docs distinguish source-controlled identifiers from external Apple/Google account access.
- [ ] No native identifiers or app metadata are changed by this task.
- [ ] Later preview and store-beta tasks can determine required account/device setup from the docs.

## Dependencies

- Depends On: `create-eas-build-profiles`
- Blocks: `verify-eas-config`
- Blocks: `../04-preview-device-build/01-build-ios-preview`
- Blocks: `../04-preview-device-build/03-build-android-preview`
- Blocks: `../06-store-beta-and-release-prep/01-configure-eas-submit`

## Technical Notes

- Current `app.json` has `ios.bundleIdentifier` and `android.package` set to `com.samisabiridrissi.darijatoenglish`.
- Current `app.json` includes `ios.appleTeamId: "57JWLP426D"`; do not treat that as proof that the local user is authenticated to the matching Apple account.
- The app uses Expo Router and `expo-dev-client`; identity docs should not imply Expo hosts the Express API.
- Keep screenshots, personal account names, and store credentials out of committed docs unless sanitized.

## Artifact Slots

- `artifacts/`: deployment doc diff summary and identity verification notes.
- `references/`: `app.json` identifier excerpts and PRD `04` / `08` references.
- `resources/`: Apple Developer, device registration, and Google Play setup checklist.
- `notes/`: ownership assumptions, unresolved account access, and identifier-change decisions.
