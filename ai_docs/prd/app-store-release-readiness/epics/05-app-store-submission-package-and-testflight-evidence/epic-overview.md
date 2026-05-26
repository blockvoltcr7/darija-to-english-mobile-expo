# Epic 05: App Store Submission Package And TestFlight Evidence

## Goal

Prepare the human-owned App Store Connect package and final TestFlight evidence for release-owner review before App Review submission.

## Scope

- Draft App Store metadata, reviewer notes, and test path.
- Create reviewer demo account path.
- Capture production screenshots.
- Fill privacy labels from the data inventory.
- Build and submit production iOS binary to TestFlight.
- Run final TestFlight smoke test.
- Record explicit release-owner approval before App Review submission.

## Tasks

1. `01-draft-store-metadata-and-reviewer-notes`
2. `02-create-reviewer-demo-account-path`
3. `03-capture-production-screenshots`
4. `04-fill-privacy-labels-from-inventory`
5. `05-build-and-submit-production-ios-to-testflight`
6. `06-run-final-testflight-smoke-and-evidence`
7. `07-record-release-owner-approval-for-app-review`

## Dependencies

- Depends On: `00-submission-baseline-and-app-store-inventory/write-submission-baseline-evidence`
- Depends On: `01-legal-privacy-and-consent/update-privacy-inventory-and-release-copy`
- Depends On: `02-account-deletion-and-data-lifecycle/verify-deletion-access-denial-and-evidence`
- Depends On: `03-production-runtime-and-abuse-controls/run-production-smoke-test`
- Depends On: `04-production-ios-ui-and-native-readiness/review-privacy-manifest-and-upload-warnings`

## Exit Criteria

- App Review package has privacy policy URL, support URL, reviewer demo credentials, notes, screenshots, and privacy labels.
- Final TestFlight run uses production runtime and succeeds.
- Release owner approves submitting for App Review.

<!-- ENRICHED-OVERVIEW-START -->
## Enriched Overview

### Scope

Epic 05 prepares the final App Store Connect/TestFlight handoff after legal, account deletion, production runtime, usage controls, and production iOS UI/native readiness are complete. The epic is documentation- and operator-heavy: it drafts store metadata, creates a reviewer-safe login path, captures production UI screenshots, fills privacy labels, submits the production iOS binary to TestFlight, runs the final production TestFlight smoke test, and records explicit release-owner go/no-go approval. No task should record secrets, private audio, full transcripts, generated audio bytes, or Apple credential material.

### Task Summary

| # | Slug | Type | Summary | Key Dependencies |
|---|---|---|---|---|
| 01 | `draft-store-metadata-and-reviewer-notes` | Infrastructure | Draft App Store metadata, reviewer notes, AI disclosure, test path, expected processing time, and release-owner-editable copy. | Legal/privacy release copy; privacy manifest/upload-warning review. |
| 02 | `create-reviewer-demo-account-path` | Infrastructure | Define a reliable reviewer login path and secure credential handoff outside the repo. | Task 01; Clerk auth-method inventory; production runtime smoke. |
| 03 | `capture-production-screenshots` | UI | Capture App Store screenshots from production/release UI with diagnostics and private content hidden. | Task 02; iPhone/iPad layout or tablet-support decision. |
| 04 | `fill-privacy-labels-from-inventory` | Infrastructure | Map the final privacy inventory to App Store Connect privacy-label answers without hiding server-side collection. | Task 03; privacy/legal inventory; account deletion evidence. |
| 05 | `build-and-submit-production-ios-to-testflight` | Infrastructure | Verify production EAS/App Store gates, build the production iOS binary, submit to TestFlight, and record sanitized build/submit evidence or human-owned blockers. | Task 04; production submit credential decision; production runtime smoke; upload-warning review; tablet decision. |
| 06 | `run-final-testflight-smoke-and-evidence` | Code | Run the reviewer path on the production TestFlight build and capture sanitized production runtime success evidence. | Task 05; production API and Trigger smoke. |
| 07 | `record-release-owner-approval-for-app-review` | Infrastructure | Consolidate evidence and record the release owner's explicit App Review go/no-go decision. | Tasks 01, 04, and 06; all PRD definition-of-done gates. |

### Execution Notes

- Task 05 is the production build/submit bridge: it must not proceed while `ai_docs/deployment/production-api.md` still has no verified production HTTPS API URL or while Trigger completion depends on a local Development worker.
- `eas.json` currently has a production build profile but an empty `submit.production`; the production submit strategy, App Store Connect app ID, and credential handling must be approved before `eas submit --profile production`.
- `app.json` keeps `ios.supportsTablet=true`, `ITSAppUsesNonExemptEncryption=false`, and `runtimeVersion.policy=appVersion`; downstream screenshots, upload warnings, and TestFlight evidence must match those release assumptions.
- Use task-local artifact templates as future evidence slots only. Do not fabricate command outputs, EAS IDs, TestFlight processing states, or release approvals during enrichment.
- Shared unresolved decisions remain production resource isolation, production EAS public env values, production submit credential strategy, and release-owner approval to submit for App Review.
<!-- ENRICHED-OVERVIEW-END -->
