# Production iOS TestFlight Runbook

This checklist is for the execution agent/operator. Do not run production build or submit commands until upstream gates are satisfied and the release owner is available for Apple/EAS prompts.

## Preflight Gates

- [ ] `03-production-runtime-and-abuse-controls/run-production-smoke-test` has verified production API and production Trigger without local `trigger dev`.
- [ ] `04-production-ios-ui-and-native-readiness/review-privacy-manifest-and-upload-warnings` has no unresolved upload warning that blocks submission.
- [ ] `04-production-ios-ui-and-native-readiness/verify-iphone-ipad-layouts-or-tablet-decision` resolves `ios.supportsTablet=true` with iPad evidence or an intentional config change.
- [ ] `fill-privacy-labels-from-inventory` has a release-owner-ready privacy label checklist.
- [ ] `00-submission-baseline-and-app-store-inventory/decide-production-submit-and-credentials` approves the production submit strategy and whether `submit.production.ios.ascAppId` should be committed.
- [ ] EAS production public env contains only mobile-safe public values, especially the verified production `EXPO_PUBLIC_API_BASE_URL` and Clerk publishable key.

## Static Verification

Run from the repo root:

```bash
node --check server/index.mjs
npm run typecheck
npm run lint
npx expo-doctor
```

Record pass/fail status only. If output includes env values, account details, or paths to private credentials, redact before adding evidence.

## Config Check

Use non-secret config inspection:

```bash
npx eas-cli@latest config --profile production --platform ios --non-interactive
git rev-parse HEAD
```

Record:

- EAS profile: `production`.
- EAS environment: `production`.
- EAS channel: `production`.
- Bundle ID and app version/build number.
- Runtime version policy.
- Production API URL class only, not full secret-bearing env output.

## Build

```bash
npx eas-cli@latest build -p ios --profile production
```

If the release owner chooses automatic submit after production submit config is ready, use only the approved command variant and record that decision in the artifact:

```bash
npx eas-cli@latest build -p ios --profile production --auto-submit
```

## Submit

Preferred explicit submit after build:

```bash
npx eas-cli@latest submit -p ios --profile production --latest
```

If `submit.production` is still empty, EAS may prompt interactively. Treat credential setup, missing `ascAppId`, Apple agreements, App Store Connect app state, or API key creation as release-owner handoffs rather than repo-owned secrets.

## Evidence Capture

Fill `artifacts/production-ios-testflight-evidence-template.md` after execution with:

- Static verification statuses.
- EAS build ID/URL and final build status.
- App version and iOS build number.
- EAS profile, environment, channel, and runtime version.
- Commit SHA.
- App Store Connect app ID.
- EAS submit ID/status and TestFlight processing state.
- Upload warnings or blocker summaries with no credential values.

Do not include private audio, full transcripts, generated audio bytes, Apple credentials, `.p8` files, app-specific passwords, Expo tokens, `.env` values, API keys, or private account screenshots.
