# Task 02: Create Store Beta Builds

## Type

Infrastructure

## Context

The app has already been installed and verified on a physical iPhone through internal distribution. Store beta is the next distribution level: production-signed binaries uploaded to TestFlight and/or Google Play testing while still avoiding public release. The PRD Phase 7 deliverable is a release candidate distributed through store testing, with API/Trigger/runtime assumptions documented before any wider beta.

## Implementation

- Start from `eas.json`: use `npx eas-cli@latest build -p ios --profile staging` for TestFlight-intended iOS and `npx eas-cli@latest build -p android --profile staging` for Play testing when account prerequisites are ready.
- Confirm the build loads the expected public env before submission with `npx eas-cli@latest config --profile staging --platform <ios|android>` and app diagnostics after installation/TestFlight availability.
- Submit only through configured EAS Submit, for example `npx eas-cli@latest submit -p ios --profile staging --latest`; otherwise record the exact blocker from Task 01.
- Capture EAS build IDs, submit IDs, store processing state, tester availability, API URL evidence, and any account/manual blocker.
- Do not claim public-release readiness from a TestFlight/Play test upload; this task only proves store beta distribution.

## Human In The Loop

- Required level: medium to high.
- Programmatic work: run EAS config/build/submit commands, monitor build status, inspect logs, capture build IDs, update artifacts, and classify failures.
- Human actions: approve Apple credential prompts, confirm App Store Connect/TestFlight processing, add testers or tester groups, complete Google Play first-upload/app setup if required, and confirm store dashboard state.
- Pause points: stop before submitting to any production/public track, adding external testers, changing store metadata, accepting legal prompts, or exposing beta access beyond the intended tester group.
- Computer-use option: Codex can help navigate EAS, App Store Connect, or Play Console screens, but the user must stay present for account prompts, 2FA, tester invitations, and track/release approvals.

## Acceptance Criteria

- [ ] iOS TestFlight build is created/submitted or blocked with a precise Apple/App Store Connect reason.
- [ ] Android Google Play testing build is created/submitted or blocked with a precise Play Console/service account reason.
- [ ] Build IDs, submit IDs when present, build profile, channel, EAS environment, and API target are captured in sanitized artifacts.
- [ ] Any human approval, tester setup, or portal-only action is recorded with owner and status.
- [ ] The build is verified to target a non-local HTTPS API, or the task is marked blocked before tester rollout.
- [ ] Any missing account setup is documented as a blocker and not treated as a passing beta build.

## Dependencies

- Depends On: configure-eas-submit
- Blocks: add-release-rollback-checklist

## Technical Notes

- Current source uses EAS `staging` as a store-distribution profile backed by the default `preview` EAS environment. Keep that distinction visible in artifacts.
- `app.json` already has `expo-updates` URL and `runtimeVersion.policy = "appVersion"`; any native dependency/runtime change after a store build requires a new build, not only an update.
- Store builds cannot be installed like internal ad hoc builds; use TestFlight / Google Play testing surfaces unless Android is intentionally built as an APK for a separate reason.
- Preserve the known npm peer-resolution guard: remote build installs rely on the repo dependency setup that fixed the earlier EAS install failure.
- Keep iOS and Android independently passable or blockable; do not mark one platform complete because the other platform succeeded.

## Artifact Slots

- `artifacts/`: EAS build/submit evidence template, sanitized store processing notes, and tester availability notes.
- `references/`: build profile, submit profile, app identity, and prior physical-device QA references.
- `resources/`: exact build, config, submit, and build-list commands.
- `notes/`: store account blockers, API-target decisions, and platform deferrals.
