# Review Privacy Manifest And Upload Warnings

## Type

Infrastructure

## Context

The PRD definition of done requires final TestFlight/App Store Connect upload warnings to be reviewed and captured as sanitized evidence before the final submission package. This task focuses on the native review boundary: Expo config, dependency/privacy manifest warnings, microphone permission, encryption/export assumptions, and whether any warning creates a blocker before Epic 05 builds and submits the production binary.

## Implementation

Use `resources/privacy-manifest-upload-warning-checklist.md`. Run static checks (`node --check server/index.mjs`, `npm run typecheck`, `npm run lint`, `npx expo-doctor`) when code/config changed. When a release binary is available, inspect EAS build/upload output and App Store Connect/TestFlight emails or UI warnings for privacy manifest, required-reason API, permissions, encryption, dependency, and upload-processing issues. Record warnings in the template under `artifacts/upload-warning-review-template.md`; resolve, accept with rationale, or mark as blockers. Prefer `app.json`/Expo config plugin changes over generated native edits.

## Acceptance Criteria

- [ ] Static verification output is summarized without secrets and any failure is classified as resolved, accepted, or blocker.
- [ ] TestFlight/App Store Connect upload warnings are reviewed for privacy manifest, required-reason API, microphone permission, encryption/export, dependency, and processing issues.
- [ ] Each warning has an owner decision: resolved with change, accepted with rationale, or marked as a blocker for Epic 05.
- [ ] No local Expo module, SwiftUI adoption, or generated native-file edit is introduced unless a concrete documented blocker requires it and the release owner approves.
- [ ] Epic 05 can cite a sanitized warning-review artifact before production submission.

## Dependencies

- Depends On: `verify-iphone-ipad-layouts-or-tablet-decision`
- Depends On: `00-submission-baseline-and-app-store-inventory/confirm-encryption-tablet-and-ota-policy`
- Depends On: `03-production-runtime-and-abuse-controls/run-production-smoke-test`
- Blocks: `05-app-store-submission-package-and-testflight-evidence/build-and-submit-production-ios-to-testflight`
- Blocks: `05-app-store-submission-package-and-testflight-evidence/run-final-testflight-smoke-and-evidence`
- Blocks: `05-app-store-submission-package-and-testflight-evidence/record-release-owner-approval-for-app-review`

## Technical Notes

- Current native anchors: `app.json` plugins (`expo-audio`, `expo-secure-store`, `expo-web-browser`, Clerk), `ios.infoPlist.ITSAppUsesNonExemptEncryption=false`, `ios.supportsTablet=true`, and `runtimeVersion.policy=appVersion`.
- `package.json` includes Expo SDK 55 dependencies that may affect privacy manifest or required-reason API warnings through native modules.
- Apple may surface privacy manifest/required-reason API issues during upload processing; capture the warning text category and path but redact account-private details.
- Native permission/config changes require a new binary path. OTA updates are not appropriate for new native permissions, data categories, or materially different privacy behavior.

## Artifact Slots

- `artifacts/upload-warning-review.md`: filled execution-time static check and upload warning review.
- `artifacts/upload-warning-review-template.md`: template provided by enrichment; duplicate or fill during execution.
- `references/privacy-manifest-upload-source-anchors.md`: local native config, dependency, PRD, Apple, and Expo anchors.
- `resources/privacy-manifest-upload-warning-checklist.md`: static check and warning-review commands/checklist.
- `notes/native-boundary-decisions.md`: accepted warnings, blockers, and any approved native/config-plugin boundary.
