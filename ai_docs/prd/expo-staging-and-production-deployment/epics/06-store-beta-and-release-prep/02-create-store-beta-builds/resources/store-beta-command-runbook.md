# Store Beta Command Runbook

Use this as the execution checklist. Do not paste secrets or full credential outputs into artifacts.

## Preconditions

- Epic 05 staging E2E evidence is passed.
- `git status --short` has no unexpected release-blocking config drift.
- `npx eas-cli@latest whoami` shows the intended Expo account.
- The intended API target is known before build:
  - staging store beta: EAS `preview` environment, staging channel, staging HTTPS API.
  - production release candidate: EAS `production` environment only after production API exists.
- App Store Connect and/or Google Play Console access is available to the human operator if CLI prompts require it.

## Inspect Effective Config

```bash
npx eas-cli@latest whoami
npx eas-cli@latest config --profile staging --platform ios --non-interactive
npx eas-cli@latest config --profile staging --platform android --non-interactive
```

Record the profile, platform, channel, environment, bundle/package ID, and whether required public env values are present. Do not copy `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` values into artifacts.

## iOS TestFlight Path

```bash
npx eas-cli@latest build -p ios --profile staging
npx eas-cli@latest build:list --platform ios --limit 3 --json
```

After a successful store build:

```bash
npx eas-cli@latest submit -p ios --profile staging --latest
```

Record:

- EAS build ID and URL.
- Build profile: `staging`.
- EAS environment: `preview`.
- Channel: `staging`.
- App Store Connect/TestFlight processing status.
- Any Apple credential, App Store Connect app, export-compliance, or Beta App Review blocker.

## Android Play Testing Path

```bash
npx eas-cli@latest build -p android --profile staging
npx eas-cli@latest build:list --platform android --limit 3 --json
```

After a successful store build:

```bash
npx eas-cli@latest submit -p android --profile staging --latest
```

Record:

- EAS build ID and URL.
- Build profile: `staging`.
- EAS environment: `preview`.
- Channel: `staging`.
- Google Play track selected by the submit profile or prompt.
- Any first-upload, service-account, app ownership, package-name, or Play review blocker.

## Combined Build And Submit Option

Only use this when submit credentials are already understood:

```bash
npx eas-cli@latest build -p ios --profile staging --auto-submit
npx eas-cli@latest build -p android --profile staging --auto-submit
```

For this task, the safer default is build first, inspect the build metadata, then submit explicitly.

## Verification After Store Processing

- Install the processed TestFlight or Play testing build.
- Open the diagnostics panel.
- Confirm the API target is HTTPS and non-local.
- Confirm the build targets the intended staging API before claiming beta readiness.
- If Trigger.dev is still in the local Development-worker scope, record that as a store-beta blocker or limitation.
