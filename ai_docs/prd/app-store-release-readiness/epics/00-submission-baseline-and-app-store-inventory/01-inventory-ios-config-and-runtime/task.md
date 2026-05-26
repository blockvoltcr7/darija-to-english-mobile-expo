# Inventory iOS Config And Runtime

## Type

Infrastructure

## Context

Phase 0 of the App Store release PRD requires a source-grounded baseline for app identity, EAS lanes, package/runtime versions, and App Store Connect identifiers before legal, auth, runtime, UI, and final submission work proceeds. `ai_docs/prd/app-store-release-readiness/06-technical-specifications.md` defines the iOS native release contract, and `09-implementation-phases.md` names this inventory as the first Phase 0 deliverable. This task prevents later epics from relying on stale `app.json`, `eas.json`, package, or TestFlight assumptions.

## Implementation

Inspect `app.json`, `eas.json`, `package.json`, `ai_docs/deployment/README.md`, `ai_docs/deployment/release-checklist.md`, and `ai_docs/deployment/testflight-qa-log.md`. Create a sanitized inventory artifact that records app name/slug/version, `ios.bundleIdentifier`, `ios.appleTeamId`, `ios.supportsTablet`, `ios.infoPlist.ITSAppUsesNonExemptEncryption`, `runtimeVersion.policy`, `updates.url`, EAS build profiles, EAS submit profiles, channels, environments, known App Store Connect app ID, latest known TestFlight build evidence, and release-owner decisions still open. Use `resources/config-inventory-checklist.md`; do not inspect or copy `.env`, credential stores, Apple private keys, or EAS credential values.

## Acceptance Criteria

- [ ] A sanitized app/runtime inventory is written under `artifacts/` with source files and inspection date.
- [ ] Inventory names the exact release-sensitive keys from `app.json`, `eas.json`, and `package.json`.
- [ ] Inventory distinguishes confirmed source facts, documented deployment facts, and release-owner decisions still needed.
- [ ] Inventory records whether the known App Store Connect app ID came from `eas.json`, TestFlight evidence, or live owner confirmation.
- [ ] No `.env` values, Apple credential material, EAS credential values, private keys, access tokens, or account screenshots with sensitive data are captured.

## Dependencies

- Depends On: None.
- Blocks: `decide-production-submit-and-credentials`
- Blocks: `inventory-clerk-auth-and-apple-sign-in`
- Blocks: `confirm-encryption-tablet-and-ota-policy`
- Blocks: `write-submission-baseline-evidence`

## Technical Notes

- Current source anchors: `app.json` declares bundle ID, Apple Team ID, tablet support, export-compliance key, EAS project ID, runtime policy, and update URL; `eas.json` declares `development`, `preview`, `staging`, and `production` build profiles plus a populated staging submit profile and empty production submit profile.
- `package.json` anchors Expo SDK/runtime packages and release scripts, especially `qa:testflight:preflight`, `trigger:deploy:prod`, `lint`, and `typecheck`.
- `ai_docs/deployment/production-api.md` currently says no production API URL is verified, so production EAS public env must remain a future gate rather than a confirmed fact.
- Treat App Store Connect account state as time-sensitive. Prefer release-owner confirmation or safe CLI/account dashboard summaries over memory.

## Artifact Slots

- `artifacts/`: sanitized app/runtime inventory table and optional release-owner confirmation note
- `references/`: config, deployment, PRD, and official-doc anchors used during the inventory
- `resources/`: repeatable config inspection checklist and command list
- `notes/`: open release-owner decisions, account-access blockers, and stale-evidence warnings
