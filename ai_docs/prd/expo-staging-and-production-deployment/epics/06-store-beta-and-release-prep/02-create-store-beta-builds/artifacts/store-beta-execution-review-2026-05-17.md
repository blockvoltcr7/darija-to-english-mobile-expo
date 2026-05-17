# Store Beta Execution Review - 2026-05-17

## Summary

- Result: blocked on human-owned store setup and production-runtime decisions.
- Platforms reviewed: iOS TestFlight and Android Google Play testing.
- Store beta build commands run: none.
- Store submit commands run: none.
- EAS account check: `npx eas-cli@latest whoami` confirmed the local CLI is authenticated to the expected Expo account owner.
- EAS CLI version: `eas-cli/18.13.0 darwin-arm64 node-v22.17.1`.

This review intentionally stopped before `eas build`, `eas submit`, and `submit:configure` because those actions can prompt for Apple/Google credentials, App Store Connect app records, Google Play service-account authorization, 2FA, tester setup, or store-track choices.

## Build Lane Reviewed

| Item | Current value | Store-beta note |
| --- | --- | --- |
| Build profile | `staging` | Store-distribution profile intended for TestFlight / Google Play testing. |
| EAS environment | `preview` | Expected current no-paid-plan shape; custom Expo staging env remains unavailable. |
| Channel | `staging` | Separate update channel for release-candidate testing. |
| iOS bundle ID | `com.samisabiridrissi.darijatoenglish` | Must match App Store Connect app record. |
| Android package | `com.samisabiridrissi.darijatoenglish` | Must match Google Play Console package ownership. |
| App version | `1.0.0` | Runtime version follows `appVersion`; native/runtime changes require a new build. |

## iOS TestFlight Status

- Result: blocked, not failed.
- Reason: App Store Connect app record, TestFlight processing path, tester setup, and any required Apple credential prompts are human-owned and not verified in this non-interactive execution.
- Build command to run when the account owner is present:

```bash
npx eas-cli@latest build -p ios --profile staging
```

- Submit command after a successful build and credential confirmation:

```bash
npx eas-cli@latest submit -p ios --profile staging --latest
```

Evidence required before marking iOS passed:

- EAS build ID and URL.
- TestFlight/App Store Connect processing state.
- App Store Connect app ID or portal confirmation, without credentials.
- Intended tester group and whether testers were invited.
- Installed TestFlight build confirms a non-local HTTPS API target.

## Android Google Play Status

- Result: blocked, not failed.
- Reason: Google Play Console app ownership, first-upload state, service-account/API setup, and testing track selection are human-owned and not verified in this non-interactive execution.
- Build command to run when the account owner is present:

```bash
npx eas-cli@latest build -p android --profile staging
```

- Submit command after a successful build and credential confirmation:

```bash
npx eas-cli@latest submit -p android --profile staging --latest
```

Evidence required before marking Android passed:

- EAS build ID and URL.
- Google Play app/package ownership confirmation.
- Track selected, expected default `internal` unless release owner chooses otherwise.
- Submit ID or Play Console processing state.
- Installed testing build confirms a non-local HTTPS API target.

## API And Runtime Gate

Store beta may target the staging-backed API only as a labeled exception. Current production API readiness is deferred in `ai_docs/deployment/production-api.md`, and production mobile builds remain no-go until `EXPO_PUBLIC_API_BASE_URL` has a chosen production HTTPS target.

Known runtime limitation to carry into any beta decision:

- The verified full translation path currently depends on Trigger.dev Development worker execution for the no-paid path. Store beta testers will not receive completed translations unless the chosen API and Trigger worker runtime are reachable and running for that beta lane.

## Human Actions Required

| Area | Owner | Required action before build/submit |
| --- | --- | --- |
| Apple Developer | Human account owner | Confirm access to team `57JWLP426D`, agreements, and 2FA readiness. |
| App Store Connect | Human account owner | Confirm or create app record for `com.samisabiridrissi.darijatoenglish`; configure TestFlight path. |
| Google Play Console | Human account owner | Confirm app/package ownership and testing track. |
| Google Play service account | Human account owner | Create/authorize service account or choose owner-run interactive submit without committing credentials. |
| Release owner | Human decision | Decide whether store beta can be staging-backed or must wait for production API/Trigger readiness. |
| Tester management | Human release owner | Add testers/groups only after approving beta audience and runtime limitations. |

## Redaction Check

- No Expo access tokens included.
- No Apple passwords, 2FA codes, app-specific passwords, or private key material included.
- No Google service-account JSON included.
- No Clerk session tokens or API keys included.
- No `.env` values included.
- No private audio, transcript, or provider output included.
