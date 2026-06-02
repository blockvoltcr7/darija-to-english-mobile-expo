# App Store Release Readiness Epics

Source mode: PRD

Source PRD: `ai_docs/prd/app-store-release-readiness/`

This package contains seeded and enriched epic/task folders for moving Darija to English from TestFlight validation toward a public iOS App Store submission. The task specs are ready for analysis, but no task `plan.md` files are present yet, so execution should start with `analyze-epic` before `run-epic-codex`.

## Source Context

The source PRD defines an iOS-only release-readiness track. Android, subscriptions, provider replacement, and model-pipeline redesign are out of scope. The release blockers are App Store-facing and runtime-facing: account deletion, privacy/legal disclosure, third-party AI consent, production API and Trigger runtime, usage controls, production UI cleanup, native iOS readiness, privacy labels, reviewer access, and final TestFlight evidence.

The seeded epic structure follows `13-epic-enrichment-plan.md` and cross-checks task boundaries against `09-implementation-phases.md`, `11-definition-of-done.md`, and `12-app-store-privacy-data-inventory.md`.

## Epic Index

| Epic | Folder | Goal | Task Count |
| --- | --- | --- | ---: |
| 00 | `00-submission-baseline-and-app-store-inventory` | Freeze iOS binary, auth, native, OTA, and submit assumptions before deeper work. | 5 |
| 01 | `01-legal-privacy-and-consent` | Publish/link legal surfaces and block audio processing until required consent is accepted. | 5 |
| 02 | `02-account-deletion-and-data-lifecycle` | Add in-app account deletion with app-owned data and storage cleanup. | 6 |
| 03 | `03-production-runtime-and-abuse-controls` | Move public review traffic to production runtime and add provider-cost safety controls. | 7 |
| 04 | `04-production-ios-ui-and-native-readiness` | Hide beta/debug internals and verify production iOS behavior across supported devices. | 6 |
| 05 | `05-app-store-submission-package-and-testflight-evidence` | Prepare App Store Connect materials, final TestFlight evidence, and release-owner approval. | 7 |

## Major Structuring Decisions

- Production runtime and abuse controls are combined into Epic 03 because both are enforced at the API/provider boundary before paid model calls.
- Native iOS readiness is kept with production UI cleanup in Epic 04 because permission copy, diagnostics visibility, screenshots, and iPad behavior must match the submitted binary.
- App Store metadata and final TestFlight evidence remain in Epic 05 because they must reflect the final legal copy, privacy labels, runtime, and UI.
- Evidence capture appears inside each epic, not only at the end, so later execution can prove each release gate without exposing secrets, private audio, full transcripts, Apple credentials, or `.env` values.

## Cross-Epic Dependencies

```text
00-submission-baseline-and-app-store-inventory
  |
  +--> 01-legal-privacy-and-consent
  |       |
  |       +--> 02-account-deletion-and-data-lifecycle
  |       +--> 04-production-ios-ui-and-native-readiness
  |
  +--> 03-production-runtime-and-abuse-controls
          |
          +--> 04-production-ios-ui-and-native-readiness

00 + 01 + 02 + 03 + 04
  |
  v
05-app-store-submission-package-and-testflight-evidence
```

## Handoff

Start with:

```bash
analyze-epic ai_docs/prd/app-store-release-readiness/epics/00-submission-baseline-and-app-store-inventory
```
