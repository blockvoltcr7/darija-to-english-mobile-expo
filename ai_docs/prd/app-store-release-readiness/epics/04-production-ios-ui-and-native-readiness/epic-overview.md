# Epic 04: Production iOS UI And Native Readiness

## Goal

Ship a polished public iOS build that hides beta/debug internals by default and satisfies native App Store review expectations.

## Scope

- Add release-mode flags.
- Hide diagnostics, API URL, raw provider transcripts, model metadata, and provider operation details in production.
- Replace QA wording and improve microphone permission copy.
- Verify record, upload, playback, permission denial, iPhone, and iPad behavior.
- Review privacy manifest and App Store Connect upload warnings.

## Tasks

1. `01-add-release-mode-config-flags`
2. `02-hide-production-diagnostics-and-provider-internals`
3. `03-replace-qa-and-permission-copy`
4. `04-verify-record-upload-playback-and-permission-states`
5. `05-verify-iphone-ipad-layouts-or-tablet-decision`
6. `06-review-privacy-manifest-and-upload-warnings`

## Dependencies

- Depends On: `01-legal-privacy-and-consent/add-in-app-legal-surfaces`
- Depends On: `03-production-runtime-and-abuse-controls/configure-production-auth-storage-and-providers`

## Exit Criteria

- Production UI shows the user workflow only by default.
- iPhone and iPad behavior is verified, or tablet support is intentionally changed before submission.
- Upload/privacy warnings are captured as sanitized evidence.

<!-- ENRICHED-OVERVIEW-START -->
## Enriched Overview

### Scope

Epic 04 makes the iOS binary reviewable after legal/privacy and production-runtime foundations are in place. It adds a small public Expo release config contract, uses that contract to hide diagnostics/provider internals in production UI, replaces QA/generic copy, verifies record/upload/playback/permission behavior, confirms iPhone/iPad layout readiness or a tablet-support decision, and captures sanitized privacy manifest/upload-warning evidence. It does not execute App Store submission; Epic 05 owns final screenshots, metadata, TestFlight submission, and release-owner approval.

### Task Summary

| # | Slug | Type | Summary | Key Dependencies |
|---|---|---|---|---|
| 1 | `add-release-mode-config-flags` | Infrastructure | Extend `lib/config.ts` with `APP_ENV`, `IS_PRODUCTION`, diagnostics, legal URL, consent-version, and OTA policy config while preserving API URL fallbacks and public/server-only env separation. | `03-production-runtime-and-abuse-controls/configure-production-auth-storage-and-providers`, `01-legal-privacy-and-consent/update-privacy-inventory-and-release-copy` |
| 2 | `hide-production-diagnostics-and-provider-internals` | UI | Gate translate/history API URL, diagnostics, raw transcripts, model metadata, and provider runs behind diagnostics/support mode while keeping the user workflow and response contracts intact. | `add-release-mode-config-flags` |
| 3 | `replace-qa-and-permission-copy` | UI | Replace QA-oriented signup/copy, align release copy with legal/privacy inventory, and update `app.json` microphone permission text through a new-binary path. | `hide-production-diagnostics-and-provider-internals`, `01-legal-privacy-and-consent/add-in-app-legal-surfaces`, `01-legal-privacy-and-consent/update-privacy-inventory-and-release-copy` |
| 4 | `verify-record-upload-playback-and-permission-states` | Code | Verify clean microphone prompt, record path, upload path, text results, TTS playback behavior, and denied-permission recovery with sanitized release-mode evidence. | `replace-qa-and-permission-copy`, `03-production-runtime-and-abuse-controls/run-production-smoke-test` |
| 5 | `verify-iphone-ipad-layouts-or-tablet-decision` | UI | Prove small iPhone, large iPhone, and iPad release layouts, or document an approved tablet-disable config/binary decision. | `verify-record-upload-playback-and-permission-states`, `00-submission-baseline-and-app-store-inventory/confirm-encryption-tablet-and-ota-policy` |
| 6 | `review-privacy-manifest-and-upload-warnings` | Infrastructure | Run static checks and review EAS/App Store Connect/TestFlight warnings for privacy manifest, required-reason API, permission, encryption/export, dependency, and upload-processing issues. | `verify-iphone-ipad-layouts-or-tablet-decision`, `00-submission-baseline-and-app-store-inventory/confirm-encryption-tablet-and-ota-policy`, `03-production-runtime-and-abuse-controls/run-production-smoke-test` |

### Execution Notes

- Shared code touchpoints are `lib/config.ts`, `app/translate.tsx`, `app/history.tsx`, `app/signup.tsx`, `app/account.tsx`, `app/index.tsx`, `app.json`, and, for verification context, `components/EnglishAudioPlayback.tsx`, `lib/api.ts`, and `lib/types.ts`.
- Preserve response contracts and backend data; production cleanup is primarily presentation gating plus native/config copy updates.
- Use task-local `references/` and `resources/` files before implementation or QA. The `artifacts/*-template.md` files are templates only and must be filled with real execution evidence later.
- Do not count local Trigger.dev Development worker success as public App Review readiness; production runtime proof comes from Epic 03.
- Native permission/config changes require a rebuilt iOS binary. EAS Update is not the right path for new native permissions, data categories, runtime changes, or material privacy/AI behavior changes.
- Screenshots and evidence must avoid secrets, `.env` values, Clerk tokens, private audio, full transcripts, generated audio bytes, and account-private Apple credential details.

### Unresolved Assumptions

- Production API URL, production public EAS env values, public legal URLs, consent version, and OTA policy version must be finalized before release-mode builds.
- The tablet decision from Epic 00 controls whether this epic must verify iPad layouts or document a tablet-disable binary path.
- Privacy manifest/App Store Connect warning evidence requires a real build/upload surface and may remain human/account-bound until Epic 05.
<!-- ENRICHED-OVERVIEW-END -->
