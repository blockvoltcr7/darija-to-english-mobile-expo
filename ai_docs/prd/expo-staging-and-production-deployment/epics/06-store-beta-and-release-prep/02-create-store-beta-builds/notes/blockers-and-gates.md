# Store Beta Blockers And Gates

## Gates Before Running Store Builds

- Epic 05 staging E2E QA must be passed. Current local evidence shows it passed on physical iPhone using preview build `32823c20-98fe-46ea-bed9-991f4b38ff27`, EAS `preview` environment, and local Trigger.dev Development worker.
- Package-manager drift from prior Trigger.dev command usage must be resolved before release prep if it affects install/build reproducibility.
- Confirm whether the store-beta target is staging-only or a production release candidate. The current task should default to staging-only because production API values are not documented as ready.

## iOS / TestFlight Blockers To Check

- Apple Developer account access for team `57JWLP426D`.
- App Store Connect app exists for bundle ID `com.samisabiridrissi.darijatoenglish`.
- App Store Connect app ID / `ascAppId` known or discoverable during submit.
- Export-compliance status accepted. Source config sets `ITSAppUsesNonExemptEncryption` to `false`, but App Store Connect may still ask review questions.
- TestFlight processing status captured after upload.
- External TestFlight testing requires Beta App Review; internal testing may be available after processing.

## Android / Google Play Blockers To Check

- Google Play Console access for package `com.samisabiridrissi.darijatoenglish`.
- First manual upload requirement satisfied before API-based submissions, if Google requires it for this app.
- Google service account key or interactive submit path available without committing credentials.
- Intended testing track selected: `internal`, `alpha`, or `beta`; never `production` unless public release is explicitly in scope.

## Runtime Limitations To Carry Forward

- Store beta builds exercise mobile distribution, not server production readiness by themselves.
- The staging build profile uses the default EAS `preview` environment until the Expo account supports custom environments.
- Epic 05 evidence used a local Trigger.dev Development worker. If a beta tester is not on the developer machine and the worker is stopped, jobs can remain queued.
- The app still uses the separately hosted API through `EXPO_PUBLIC_API_BASE_URL`; store submission does not deploy or verify the API/Trigger worker.

## Success Rule

Treat the task as successful only when at least one store beta path has real build and store-processing evidence. If credentials or store listings are missing, mark the blocker clearly instead of treating the command plan as execution evidence.

## 2026-05-17 Execution Outcome

- Store build commands were not run because the next step crosses into human-owned Apple/Google account and credential prompts.
- iOS TestFlight is blocked on App Store Connect app-record/TestFlight setup and Apple credential confirmation.
- Android Play testing is blocked on Google Play app ownership, testing-track selection, and service-account or interactive submit setup.
- Production mobile builds remain no-go because `ai_docs/deployment/production-api.md` marks production API readiness as deferred.
- A staging-backed store beta is possible only if the release owner explicitly accepts that the beta points at the staging API and that the Trigger.dev Development worker path must be reachable for translation jobs.
