# Production iOS Submit Source Anchors

Use this file to orient execution of the production iOS build and TestFlight submit task. It is not execution evidence.

## Local PRD And Runbook Anchors

| Source | Why it matters |
| --- | --- |
| `ai_docs/prd/app-store-release-readiness/06-technical-specifications.md` | Defines production public env names, iOS release contract, EAS production profile expectations, and EAS Update policy fields to record. |
| `ai_docs/prd/app-store-release-readiness/11-definition-of-done.md` | Requires production submit strategy, production smoke evidence, App Store upload-warning review, and secret-safe release evidence. |
| `ai_docs/prd/app-store-release-readiness/13-epic-enrichment-plan.md` | Keeps Epic 05 last and requires production iOS TestFlight submission before final smoke and release-owner approval. |
| `ai_docs/deployment/release-checklist.md` | Separates staging beta from public release and lists no-go rules around production API, Trigger, public EAS env, and secret-safe evidence. |
| `ai_docs/deployment/production-api.md` | States that production API is currently a deferred gate and that production mobile release is blocked until the production HTTPS API URL and Trigger production task are verified. |
| `ai_docs/deployment/testflight-qa-log.md` | Shows prior staging TestFlight build evidence shape, including safe EAS build IDs, submit IDs, build numbers, channel, and processing state. |

## Current Repo Config Anchors

| File | Current relevant facts |
| --- | --- |
| `eas.json` | `build.production.environment=production`, `build.production.channel=production`, and `build.production.autoIncrement=true`; `submit.production` is currently empty while `submit.staging.ios.ascAppId=6770204437`. |
| `app.json` | iOS bundle ID is `com.samisabiridrissi.darijatoenglish`, Apple team ID is present, `supportsTablet=true`, `ITSAppUsesNonExemptEncryption=false`, `runtimeVersion.policy=appVersion`, and the EAS project ID is configured. |
| `package.json` | Static checks are `npm run typecheck`, `npm run lint`, and server syntax check via `node --check server/index.mjs`; Trigger production deploy command is `npm run trigger:deploy:prod`. |

## Official External Documentation

| Source | Relevant use |
| --- | --- |
| Expo: Submit to the Apple App Store, https://docs.expo.dev/submit/ios/ | Production iOS build prerequisite, `eas submit`, `submit.production.ios.ascAppId`, App Store Connect API key/interactive credential options, and `ascAppId` lookup path. |
| Expo: Configure EAS Submit with `eas.json`, https://docs.expo.dev/submit/eas-json/ | Confirms `submit.production.ios.ascAppId` shape and that an empty production submit profile leads to interactive prompting. |
| Expo: EAS `eas.json` reference, https://docs.expo.dev/eas/json/ | Defines `environment`, `channel`, and `autoIncrement` behavior for production builds. |
| Apple: Upload builds, https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds/ | Explains App Store Connect processing after upload and that bundle ID/version/build string associate the uploaded binary with the app record. |
| Apple: TestFlight, https://developer.apple.com/testflight/ | Confirms uploaded builds can be shared with internal/external testers after App Store Connect processing and TestFlight setup. |

## Redaction Boundary

Allowed in artifacts:

- EAS build ID or URL.
- EAS submit ID or status.
- App Store Connect app ID.
- Build number, app version, profile, channel, runtime version, commit SHA.
- TestFlight processing state and upload warnings after removing private screenshots or account details.

Disallowed in artifacts:

- Apple credentials, `.p8` contents, app-specific passwords, Expo tokens, API keys, `.env` values, private account screenshots, private audio contents, full transcripts, or generated audio bytes.
