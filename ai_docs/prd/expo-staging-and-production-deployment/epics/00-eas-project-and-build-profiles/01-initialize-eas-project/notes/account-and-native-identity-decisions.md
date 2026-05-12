# Account And Native Identity Decisions

## Current Decision

Preserve the existing native identity while creating or documenting the EAS project association.

## Current Source Values

- iOS bundle identifier: `com.samisabiridrissi.darijatoenglish`
- Android package: `com.samisabiridrissi.darijatoenglish`
- Apple Team ID in source config: `57JWLP426D`

## Ownership Notes

- `ios.appleTeamId` in source config is not proof that the current shell is authenticated to the matching Apple Developer account.
- Expo account/project ownership must be verified during EAS initialization.
- If `npx eas-cli@latest init` asks the user to choose an Expo account or project, record the choice or blocker in `artifacts/` before continuing.

## Change Policy

Do not change app name, slug, iOS bundle ID, Android package, Apple Team ID, or URL scheme inside Task 01 unless the user explicitly approves that identity change.
