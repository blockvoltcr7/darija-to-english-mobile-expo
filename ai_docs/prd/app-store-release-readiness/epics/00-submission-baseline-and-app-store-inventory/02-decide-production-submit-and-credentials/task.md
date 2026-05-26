# Decide Production Submit And Credentials

## Type

Infrastructure

## Context

The evaluator report flags production EAS submission as incomplete: `eas.json` contains `submit.staging.ios.ascAppId` while `submit.production` is empty. The App Store release PRD requires an explicit production submit strategy before any production build or TestFlight/App Review workflow can depend on automation. This is a decision and documentation task, not a credential-harvesting task; Apple authentication, App Store Connect API keys, and private `.p8` material remain release-owner controlled.

## Implementation

Use the Task 01 inventory plus `eas.json`, `ai_docs/deployment/release-checklist.md`, and `ai_docs/deployment/testflight-qa-log.md` to document the production iOS submit path. Decide whether production submit uses an App Store Connect API key in EAS, an interactive Apple ID flow, or another owner-approved process. Record whether `submit.production.ios.ascAppId` should reuse the known App Store Connect app ID or wait for live owner confirmation. If editing `eas.json`, change only non-secret submit config. Draft safe future commands for `eas build -p ios --profile production` and `eas submit -p ios --profile production --latest`, clearly marking credential prompts and account actions as human-owned.

## Acceptance Criteria

- [ ] A production submit decision record is written under `artifacts/`.
- [ ] The decision records the chosen credential strategy, App Store Connect app ID handling, and owner-owned setup steps.
- [ ] Any `eas.json` change is limited to non-secret submit metadata such as `submit.production.ios.ascAppId`.
- [ ] The artifact explicitly forbids committing `.p8` files, Apple passwords, App Store Connect API private keys, Expo access tokens, or account screenshots with credential material.
- [ ] Epic 05 can reference the documented build/submit sequence without reopening the credential-strategy decision.

## Dependencies

- Depends On: `inventory-ios-config-and-runtime`
- Blocks: `write-submission-baseline-evidence`
- Blocks: `05-app-store-submission-package-and-testflight-evidence/build-and-submit-production-ios-to-testflight`

## Technical Notes

- Current `eas.json` has `submit.staging.ios.ascAppId=6770204437` and empty `submit.production`; verify this against Task 01 before treating it as current.
- Expo's EAS Submit documentation says iOS submission requires the App Store Connect app ID and either Apple ID credential prompts or a configured App Store Connect API key. Capture the strategy, not credential values.
- EAS Submit uploads the iOS binary to App Store Connect/TestFlight; App Store metadata, screenshots, privacy questionnaire, and submit-for-review remain App Store Connect/release-owner work.
- Keep the scope iOS-only unless the release owner explicitly widens it.

## Artifact Slots

- `artifacts/`: production submit decision record and optional non-secret `eas.json` change summary
- `references/`: `eas.json`, deployment, TestFlight, and EAS Submit source anchors
- `resources/`: safe production build/submit command draft and decision checklist
- `notes/`: human-owned credential blockers, account access blockers, and approval notes
