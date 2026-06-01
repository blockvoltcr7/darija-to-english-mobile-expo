# Epic Enrichment Plan

This file was the evaluator's enrichment input for the generated epic package under:

```bash
ai_docs/prd/app-store-release-readiness/epics/
```

The goal is to keep the generated epics aligned to an iOS-only App Store release. Android is out of scope. The current handoff is to analyze Epic 00 before execution so task-local `plan.md` files are created.

## Recommended Epic Set

| Epic | Name | Goal | Key Outputs |
| --- | --- | --- | --- |
| 00 | Submission Baseline And App Store Inventory | Freeze current iOS binary/config/review assumptions. | App config audit, Clerk auth-method inventory, App Store Connect checklist, production submit decision. |
| 01 | Legal, Privacy, And Consent | Make data handling explicit and linked in-app. | Privacy/terms/deletion/AI disclosure URLs, consent persistence, first-submit consent gate. |
| 02 | Account Deletion And Data Lifecycle | Let signed-in users initiate account deletion from the app. | Delete account UI/API, storage cleanup, Clerk deletion, deletion evidence. |
| 03 | Production Runtime And Abuse Controls | Remove staging/local-worker dependency for public review. | Production API, production Trigger, provider quotas, rate limits, kill switch, smoke test. |
| 04 | Production iOS UI And Native Readiness | Make the binary reviewable and polished. | Hide debug UI, update microphone copy, verify privacy manifest, iPhone/iPad screenshots, OTA policy. |
| 05 | App Store Submission Package And TestFlight Evidence | Prepare final human-owned App Store submission. | Reviewer demo account, App Store metadata, privacy labels, screenshots, final TestFlight/App Review evidence. |

## Required Task Enrichments

### Epic 00: Submission Baseline And App Store Inventory

Tasks to include:

- Inventory `app.json`, `eas.json`, package versions, EAS channels, runtime version, and App Store Connect app ID.
- Confirm production `eas.json` submit config and credential strategy.
- Inventory production Clerk sign-in methods and decide whether Sign in with Apple is required.
- Confirm `ITSAppUsesNonExemptEncryption=false` remains valid.
- Confirm `ios.supportsTablet=true` is intentional or change it before submission.

Acceptance evidence:

- Sanitized app identity table.
- Clerk auth-method decision record.
- No Apple credentials, `.p8` keys, API keys, or `.env` values in docs.

### Epic 01: Legal, Privacy, And Consent

Tasks to include:

- Publish or link Privacy Policy, Terms, Data Deletion, AI Processing Disclosure, and Support URL.
- Add in-app legal links.
- Add consent gate before audio submission.
- Persist consent version and source.
- Update App Store privacy data inventory after final implementation.

Acceptance evidence:

- Fresh user sees consent before first audio submit.
- App Store privacy labels match `12-app-store-privacy-data-inventory.md`.
- Policy wording does not overpromise third-party provider deletion.

### Epic 02: Account Deletion And Data Lifecycle

Tasks to include:

- Add Account -> Privacy/Data -> Delete Account.
- Add authenticated account deletion endpoint.
- Delete or anonymize app-owned account data.
- Delete original audio and generated TTS artifacts from private storage.
- Delete or schedule Clerk account deletion.
- Verify second-user and post-deletion access denial.

Acceptance evidence:

- Test user can initiate deletion in-app.
- Deleted user history/playback is no longer available.
- Deletion audit evidence contains no private transcript/audio content.

### Epic 03: Production Runtime And Abuse Controls

Tasks to include:

- Deploy production Cloud Run API.
- Deploy production Trigger.dev worker.
- Configure production Clerk/Supabase/OpenAI/Modal decisions.
- Add usage reservation, rate limits, max audio size/duration, and kill switch.
- Run production smoke test from iOS build.

Acceptance evidence:

- `/health` and `/health/supabase` pass against production.
- One fresh-user production translation reaches succeeded without local `trigger dev`.
- Evidence includes only safe IDs and statuses.

### Epic 04: Production iOS UI And Native Readiness

Tasks to include:

- Hide API URL, diagnostics, model internals, and raw provider transcripts in production by default.
- Replace QA wording in signup/account/translation screens.
- Improve microphone permission copy.
- Verify document import, recording, playback, and permission denial states.
- Verify iPhone small/large and iPad layouts, or disable tablet support.
- Define EAS Update production policy.
- Review App Store Connect privacy manifest/upload warnings.

Acceptance evidence:

- Screenshots are taken from release UI only.
- Permission prompt copy is understandable and product-specific.
- No native SwiftUI or local Expo module work is introduced unless an explicit blocker requires it.

### Epic 05: App Store Submission Package And TestFlight Evidence

Tasks to include:

- Create App Store metadata draft.
- Create reviewer demo account.
- Write reviewer notes and test path.
- Capture final screenshots.
- Fill privacy labels from the inventory.
- Submit production iOS build to TestFlight before App Review.
- Run final TestFlight smoke test.

Acceptance evidence:

- App Review package has privacy policy URL, support URL, reviewer demo credentials, notes, screenshots, and privacy labels.
- Final TestFlight run uses production runtime and succeeds.
- Release owner explicitly approves submitting for App Review.

## Parallelization Guidance

- Epic 00 should run first because it freezes the review assumptions and prevents false starts.
- Epic 01 and Epic 02 can overlap after data lifecycle policy is agreed.
- Epic 03 can overlap with Epic 04 after production public env names are fixed.
- Epic 05 should remain last because screenshots, privacy labels, and reviewer notes must match the final production binary/runtime.

## No-Go Gates

- No public App Review submission while Trigger completion depends on a local Development worker.
- No public App Review submission without in-app account deletion.
- No public App Review submission without public Privacy Policy and Support URLs.
- No public App Review submission while production UI exposes QA-only wording or raw diagnostics by default.
- No production EAS public env values until the production HTTPS API URL is verified.
- No local Expo module or SwiftUI extension unless a concrete iOS release blocker is documented and approved.
