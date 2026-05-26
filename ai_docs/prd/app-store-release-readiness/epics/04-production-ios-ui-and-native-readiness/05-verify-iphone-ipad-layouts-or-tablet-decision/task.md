# Verify iPhone iPad Layouts Or Tablet Decision

## Type

UI

## Context

`app.json` currently sets `ios.supportsTablet=true`, and the PRD/evaluator report treat iPad layout quality as required unless the release owner intentionally disables tablet support before submission. This task turns the Epic 00 tablet decision into concrete layout evidence for small iPhone, large iPhone, and iPad release UI, with diagnostics hidden.

## Implementation

Use the tablet decision from `00-submission-baseline-and-app-store-inventory/confirm-encryption-tablet-and-ota-policy`. Verify release-mode UI in the screens most likely to appear in App Review screenshots: landing/auth, signup, translate idle/working/result, permission denied, history/detail, account/legal. Use `resources/device-layout-matrix.md` to record device/simulator coverage. If tablet support remains enabled, capture iPad evidence; if disabled, document the approved `app.json` config-change and binary rebuild path instead of silently skipping iPad.

## Acceptance Criteria

- [ ] Small iPhone layout evidence exists for the main workflow and contains no diagnostics/API URL/model internals.
- [ ] Large iPhone layout evidence exists for the main workflow and contains no diagnostics/API URL/model internals.
- [ ] If `ios.supportsTablet=true`, iPad layout evidence exists and no layout blocker remains for submission.
- [ ] If tablet support is disabled, the decision cites Epic 00 approval and the app config/binary path used to change support.
- [ ] Screenshots/evidence use non-sensitive accounts, filenames, and content; private transcripts and audio are redacted or avoided.

## Dependencies

- Depends On: `verify-record-upload-playback-and-permission-states`
- Depends On: `00-submission-baseline-and-app-store-inventory/confirm-encryption-tablet-and-ota-policy`
- Blocks: `review-privacy-manifest-and-upload-warnings`
- Blocks: `05-app-store-submission-package-and-testflight-evidence/capture-production-screenshots`
- Blocks: `05-app-store-submission-package-and-testflight-evidence/build-and-submit-production-ios-to-testflight`

## Technical Notes

- Current native anchor: `app.json` sets `ios.supportsTablet=true`, `orientation=portrait`, and iOS bundle metadata.
- Relevant UI anchors: `app/index.tsx`, `app/signup.tsx`, `app/translate.tsx`, `app/history.tsx`, `app/account.tsx`, and legal/delete-account surfaces from earlier epics.
- Do not use screenshots from diagnostic/support mode for App Store evidence.
- Layout blockers should be fixed before Epic 05 screenshots; do not downgrade an iPad issue to "accepted" while tablet support remains enabled unless the release owner explicitly approves the risk.

## Artifact Slots

- `artifacts/layout-evidence.md`: filled execution-time layout evidence or tablet-disable decision.
- `artifacts/layout-evidence-template.md`: template provided by enrichment; duplicate or fill during execution.
- `references/layout-tablet-source-anchors.md`: app config, UI, PRD, and cross-epic anchors.
- `resources/device-layout-matrix.md`: device/simulator matrix and screenshot rules.
- `notes/layout-blockers.md`: unresolved layout issues, tablet-scope decisions, and release-owner approvals.
