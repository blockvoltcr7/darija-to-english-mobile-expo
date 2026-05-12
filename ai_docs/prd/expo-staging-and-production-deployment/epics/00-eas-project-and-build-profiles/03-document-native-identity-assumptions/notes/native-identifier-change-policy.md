# Native Identifier Change Policy

## Default Policy

Do not change native identifiers in Task 03.

Protected values:

- `expo.name`
- `expo.slug`
- `expo.scheme`
- `ios.bundleIdentifier`
- `ios.appleTeamId`
- `android.package`

## Why This Matters

Changing identifiers can create a separate app from the perspective of EAS credentials, Apple Developer, TestFlight, Google Play, installed app data, deep links, and future release history.

## Approval Requirement

Any identifier change needs a separate explicit decision and should update:

- `app.json`
- `ai_docs/deployment/README.md`
- EAS credentials/profile notes
- Apple Developer/App Store Connect assumptions
- Google Play Console assumptions
