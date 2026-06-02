# Build And Submit Production iOS To TestFlight

## Type

Infrastructure

## Context

The App Store Release Readiness PRD requires a production iOS binary that uses the production EAS environment/channel, points at verified production runtime, and reaches App Store Connect/TestFlight before final smoke testing. `06-technical-specifications.md` and `11-definition-of-done.md` make this a release gate because the current staging beta path is not enough for public App Review. This task is credential-sensitive: Apple Developer, App Store Connect, and EAS submit actions may require release-owner participation and must not leak credentials into repo evidence.

## Implementation

Use `resources/production-ios-testflight-runbook.md` as the command path and `references/production-ios-submit-source-anchors.md` as the source map. First confirm upstream gates: production API/Trigger smoke evidence, privacy labels, App Store upload warning review, tablet decision, and approved production submit credential strategy. Verify `eas.json` still has `build.production.environment=production`, `channel=production`, and `autoIncrement=true`; configure or document `submit.production.ios.ascAppId`/credential strategy before submit. Run static checks, build with `npx eas-cli@latest build -p ios --profile production`, then submit the chosen build with the approved production submit path. Record only sanitized IDs/statuses in `artifacts/production-ios-testflight-evidence-template.md`.

## Acceptance Criteria

- [ ] `node --check server/index.mjs`, `npm run typecheck`, `npm run lint`, and `npx expo-doctor` pass, or failures are documented as blockers.
- [ ] Production EAS config is verified: profile `production`, environment `production`, channel `production`, app version/build number, bundle ID, team ID, and runtime version policy are recorded without env values.
- [ ] Production API URL and Trigger production deployment are already verified; the build is not knowingly pointed at staging/local runtime for public App Review.
- [ ] Production iOS build finishes, or the blocker identifies the exact human-owned Apple/EAS/prebuild/config issue.
- [ ] Production submit to App Store Connect/TestFlight finishes, or the blocker identifies the human-owned credential, agreement, App Store Connect, processing, or upload-warning issue.
- [ ] Evidence records sanitized EAS build ID/URL, build number, submit ID/status, App Store Connect app ID, channel, runtime version, commit SHA, and TestFlight processing state when available.
- [ ] Evidence contains no Apple credentials, `.p8` contents, passwords, Expo tokens, `.env` values, API keys, private audio, full transcripts, or generated audio bytes.

## Dependencies

- Depends On: `fill-privacy-labels-from-inventory`
- Depends On: `00-submission-baseline-and-app-store-inventory/decide-production-submit-and-credentials`
- Depends On: `03-production-runtime-and-abuse-controls/run-production-smoke-test`
- Depends On: `04-production-ios-ui-and-native-readiness/review-privacy-manifest-and-upload-warnings`
- Depends On: `04-production-ios-ui-and-native-readiness/verify-iphone-ipad-layouts-or-tablet-decision`
- Blocks: `run-final-testflight-smoke-and-evidence`
- Blocks: `record-release-owner-approval-for-app-review`

## Technical Notes

- `eas.json` currently has `submit.staging.ios.ascAppId=6770204437` but `submit.production` is empty; do not assume production submit is ready until the release owner approves the strategy.
- `app.json` anchors the iOS identity: `ios.bundleIdentifier`, `ios.appleTeamId`, `ios.supportsTablet=true`, `ios.infoPlist.ITSAppUsesNonExemptEncryption=false`, `runtimeVersion.policy=appVersion`, and the EAS project ID.
- `ai_docs/deployment/production-api.md` says no production API URL is currently verified; do not build a public-review production binary until `EXPO_PUBLIC_API_BASE_URL` is set to the chosen production HTTPS URL in the EAS production environment.
- `ai_docs/deployment/release-checklist.md` distinguishes staging TestFlight from public release and explicitly marks local Trigger worker dependency as a no-go for public production.
- Official Expo docs require a production iOS build before submit and support configuring `submit.production.ios.ascAppId`; Apple processing can take time after upload before the build appears in App Store Connect/TestFlight.

## Artifact Slots

- `artifacts/production-ios-testflight-evidence-template.md`: template for the future build/submit evidence; fill only during execution.
- `references/production-ios-submit-source-anchors.md`: local PRD/config anchors and official Expo/Apple docs that justify this task.
- `resources/production-ios-testflight-runbook.md`: safe command checklist for static verification, production EAS build, submit, and sanitized evidence capture.
- `notes/`: optional credential blockers, App Store Connect agreement prompts, TestFlight processing delays, or release-owner handoffs discovered during execution.
