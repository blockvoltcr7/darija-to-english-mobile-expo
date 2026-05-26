# Confirm Encryption Tablet And OTA Policy

## Type

Infrastructure

## Context

The iOS native release contract identifies three release-sensitive assumptions that affect App Review and downstream QA: `ITSAppUsesNonExemptEncryption=false`, `ios.supportsTablet=true`, and EAS Update behavior with `runtimeVersion.policy=appVersion`. The evaluator report says these must be settled before production screenshots, App Store metadata, upload-warning review, and binary submission. This task turns those assumptions into an explicit release-owner decision record.

## Implementation

Use Task 01 inventory plus `app.json`, `eas.json`, `ai_docs/prd/app-store-release-readiness/06-technical-specifications.md`, `08-ios-submission-evaluator-report.md`, `10-risk-assessment.md`, and `ai_docs/deployment/release-checklist.md`. Document whether the app still uses only standard HTTPS/TLS and no custom cryptography, VPN, or regulated encryption features. Decide whether `ios.supportsTablet=true` remains intentional; if yes, mark iPad evidence required in Epic 04 and Epic 05, otherwise document the approved config-change path. Define the production EAS Update policy and required evidence fields using `resources/encryption-tablet-ota-checklist.md`.

## Acceptance Criteria

- [ ] An encryption/tablet/OTA decision record is written under `artifacts/`.
- [ ] Export-compliance conclusion cites current networking/encryption assumptions and names what would invalidate `ITSAppUsesNonExemptEncryption=false`.
- [ ] Tablet decision explicitly states whether iPad QA/screenshots are required or whether a future binary config change will disable tablet support.
- [ ] EAS Update policy distinguishes allowed JavaScript-only fixes from native, privacy, auth, data-collection, runtime, or material AI changes that need binary/App Review handling.
- [ ] Future production update evidence fields are listed: channel, runtime version, commit SHA, update ID, rollback path, and owner approval.

## Dependencies

- Depends On: `inventory-ios-config-and-runtime`
- Blocks: `write-submission-baseline-evidence`
- Blocks: `04-production-ios-ui-and-native-readiness/verify-iphone-ipad-layouts-or-tablet-decision`
- Blocks: `05-app-store-submission-package-and-testflight-evidence/capture-production-screenshots`

## Technical Notes

- Current source anchors: `app.json` sets `ios.infoPlist.ITSAppUsesNonExemptEncryption=false`, `ios.supportsTablet=true`, `runtimeVersion.policy=appVersion`, and an EAS Update URL; `eas.json` maps production builds to `channel=production`.
- Apple export-compliance guidance still requires the developer to determine encryption obligations. This task records engineering facts and release-owner decision, not legal advice.
- Expo's update docs tie update compatibility to channels and runtime versions. With `appVersion` policy, native/config changes should flow through a new binary and App Review decision rather than an OTA-only update.
- Privacy manifest/upload warning capture belongs to Epic 04 and Epic 05, but this task should identify what those epics must verify.

## Artifact Slots

- `artifacts/`: encryption/tablet/OTA decision record
- `references/`: `app.json`, `eas.json`, PRD, Apple, and Expo source anchors
- `resources/`: decision checklist and future EAS Update evidence template
- `notes/`: release-owner decisions, legal/export questions, and tablet-scope caveats
