# Source Config Excerpts

Use this as the source snapshot for Task 01 before running EAS initialization.

## `app.json`

- `expo.name`: `Darija to English`
- `expo.slug`: `darija-to-english-mobile`
- `expo.version`: `1.0.0`
- `expo.scheme`: `darijaenglish`
- `ios.bundleIdentifier`: `com.samisabiridrissi.darijatoenglish`
- `ios.appleTeamId`: `57JWLP426D`
- `android.package`: `com.samisabiridrissi.darijatoenglish`
- `expo.extra.eas.projectId`: not present at the time this reference was written

## `package.json`

- Expo entrypoint: `expo-router/entry`
- Expo SDK package: `expo ~55.0.23`
- Dev client package: `expo-dev-client ~55.0.32`
- Existing scripts include local `start`, `ios`, `android`, API, and Trigger.dev commands.

## Guardrail

Task 01 should not rename the app, change the slug, change native identifiers, add provider secrets, or change API/Trigger runtime behavior.
