# EAS Submit Source Map

## Local Source Of Truth

- `eas.json` has `submit.staging` and `submit.production` placeholders only.
- `eas.json` build profile `staging` uses `distribution: "store"`, `environment: "preview"`, `channel: "staging"`, and `autoIncrement: true`.
- `eas.json` build profile `production` uses `environment: "production"`, `channel: "production"`, and `autoIncrement: true`.
- `app.json` declares iOS bundle identifier `com.samisabiridrissi.darijatoenglish` and Apple Team ID `57JWLP426D`.
- `app.json` declares Android package `com.samisabiridrissi.darijatoenglish`.
- `app.json` declares EAS project ID `70c597ff-6021-4069-bb43-9c301ac4baa2` under `expo.extra.eas.projectId` and owner `blockvoltcr7`.

## Repo Deployment Context

- `ai_docs/deployment/README.md` treats the `staging` build profile as the TestFlight / Google Play testing lane, but it currently reads the default EAS `preview` environment because custom EAS environments are plan-gated.
- `ai_docs/deployment/README.md` says TestFlight and Google Play testing setup are deferred to this store-beta/release-prep epic.
- `ai_docs/prd/expo-staging-and-production-deployment/05-technical-specifications.md` says exact submit credentials should be filled only after App Store Connect and Google Play Console setup decisions are confirmed.
- `ai_docs/prd/expo-staging-and-production-deployment/epics/05-staging-e2e-qa/05-capture-staging-qa-evidence/artifacts/staging-e2e-qa-evidence.md` records that staging E2E passed on a physical iPhone with build profile `preview`, EAS environment `preview`, and a non-local HTTPS Cloud Run API target.

## Official Docs Anchors

- Reviewed on 2026-05-17 against Expo documentation.
- Expo EAS Submit introduction: https://docs.expo.dev/submit/introduction/
- Expo EAS Submit with `eas.json`: https://docs.expo.dev/submit/eas-json/
- Expo EAS `submit` schema reference: https://docs.expo.dev/eas/json/#eas-submit
- iOS submit guide: https://docs.expo.dev/submit/ios/
- Android submit guide: https://docs.expo.dev/submit/android/

Key doc points for this task:

- `eas submit` uses the `production` submit profile by default if no profile is specified.
- Multiple submit profiles are supported, so this repo's `staging` and `production` profile names are valid.
- Android submit needs Google Play Console app access, a Google Service Account key, an Android package name, a store-ready build, and an initial manual upload before the Google Play API can be used.
- iOS submit needs Apple Developer/App Store Connect access, the bundle identifier, a store-ready build, and App Store Connect app information such as `ascAppId`.
- CI/non-interactive submit requires credentials to be configured ahead of time; otherwise the CLI may prompt for account-owned values.

## Local Drift Note

- `ai_docs/deployment/README.md` currently lists `expo.owner`, `expo.runtimeVersion`, and `expo.extra.eas.projectId` as absent, but `app.json` contains those fields. This is a deployment-doc cleanup item outside this task's owned write scope.
