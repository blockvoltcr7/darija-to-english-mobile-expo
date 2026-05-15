# Task 01: Build iOS Preview

## Type

Infrastructure

## Context

PRD Phase 5 and Definition of Done require an installable iOS build on a physical iPhone before fresh-user E2E QA. The current account has default EAS environments only: `development`, `preview`, and `production`. For this epic, the primary path is an EAS `preview` internal-distribution build that bakes the configured development HTTPS API URL into the app. An EAS `development` client build is allowed only as a documented fallback when the owner-device QA path needs the default EAS `development` environment.

## Implementation

- Read `eas.json`, `app.json`, Epic 00 verification notes, and Epic 02 EAS env evidence before building.
- Confirm `build.preview` has `distribution: "internal"`, `environment: "preview"`, and `channel: "preview"`.
- Confirm native identity remains `com.samisabiridrissi.darijatoenglish`, Apple team `57JWLP426D`, owner `blockvoltcr7`, and EAS project ID `70c597ff-6021-4069-bb43-9c301ac4baa2`.
- Run preflight commands from `resources/ios-preview-build-runbook.md`; do not print secret values.
- Build with `npx eas-cli@latest build -p ios --profile preview`.
- If switching to `--profile development`, record the reason in notes and keep Task 04's API diagnostics as the pass/fail gate.
- Save sanitized build metadata in the artifact template.

## Human-In-The-Loop

- Human must log in to Expo/EAS or provide `EXPO_TOKEN` if `npx eas-cli@latest whoami` fails.
- Human must approve or complete Apple Developer account prompts, 2FA, team selection, or credential setup if EAS cannot proceed non-interactively.
- Human must decide whether to continue with the primary `preview` profile or explicitly authorize the `development` profile fallback if the preview path is blocked.
- Human must approve any browser/UI action that creates persistent Apple/EAS credentials, changes account settings, or transmits sensitive account information.
- Codex can run local config checks, EAS CLI preflights, and the build command once authentication and account prerequisites are available.

## Acceptance Criteria

- [ ] EAS auth preflight succeeds, or the blocker names whether login/`EXPO_TOKEN` is missing.
- [ ] iOS preview config is verified from `eas.json`: internal distribution, `preview` environment, and `preview` channel.
- [ ] EAS public env evidence confirms a non-local HTTPS API URL and Clerk publishable key presence without exposing key values.
- [ ] iOS build succeeds with build ID or build URL, or Apple credential/device-registration blocker is documented with next action.
- [ ] Evidence records profile, environment, channel, bundle ID, Apple team, project ID, API URL, and command summary.
- [ ] No backend/provider secrets, Clerk session tokens, private `.env` values, or private account pages are committed.

## Dependencies

- Depends On: 00-eas-project-and-build-profiles/verify-eas-config
- Depends On: 02-eas-environments-and-config-safety/add-non-local-api-diagnostics
- Blocks: install-preview-on-iphone
- Blocks: verify-preview-app-diagnostics

## Technical Notes

- `eas.json` is the source of truth for build profile shape.
- `app.json` owns native IDs, Apple team, Expo owner, and EAS project ID.
- Epic 02 evidence shows default `development` and `preview` EAS envs are configured with public mobile values; custom EAS env names are plan-gated.
- `npx expo-doctor` currently has known Expo SDK patch-version drift from Epic 00; record it if it affects cloud build confidence.
- Internal iOS distribution may require Apple Developer access and UDID/ad hoc provisioning before install.
- If Computer Use is used for Expo or Apple web UI, pause before credential creation, permission changes, uploads, or sensitive data entry unless the user has given specific action-time approval.

## Artifact Slots

- `references/eas-ios-preview-profile.md`: local profile, identity, env evidence, and official Expo doc links.
- `resources/ios-preview-build-runbook.md`: command sequence and redaction rules.
- `artifacts/ios-preview-build-evidence-template.md`: sanitized build evidence structure.
- `notes/apple-device-registration.md`: Apple/UDID/provisioning decisions and blockers.
