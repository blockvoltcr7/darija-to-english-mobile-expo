# EAS Init Auth Blocker

## Command

```bash
npx eas-cli@latest init --non-interactive
```

## Result

The command exited with status `1` because the local shell is not authenticated to Expo.

Sanitized CLI message:

```text
An Expo user account is required to proceed.
Either log in with eas login or set the EXPO_TOKEN environment variable if you're using EAS CLI on CI.
Error: project:init command failed.
```

## Current Association State

`app.json` does not currently include `expo.extra.eas.projectId`.

## Required External Action

Log in with the intended Expo account and rerun EAS initialization:

```bash
npx eas-cli@latest login
npx eas-cli@latest init
```

Alternatively, set an `EXPO_TOKEN` for CI/non-interactive setup and rerun:

```bash
npx eas-cli@latest init --non-interactive
```

## Protected Identity Values Verified

- `expo.name`: `Darija to English`
- `expo.slug`: `darija-to-english-mobile`
- `expo.version`: `1.0.0`
- `expo.scheme`: `darijaenglish`
- `ios.bundleIdentifier`: `com.samisabiridrissi.darijatoenglish`
- `ios.appleTeamId`: `57JWLP426D`
- `android.package`: `com.samisabiridrissi.darijatoenglish`

No Expo account tokens, provider secrets, or local credentials were recorded.
