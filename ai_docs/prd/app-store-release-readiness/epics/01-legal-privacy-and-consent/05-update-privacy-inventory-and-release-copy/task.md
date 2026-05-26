# Update Privacy Inventory And Release Copy

## Type

Code

## Context

`12-app-store-privacy-data-inventory.md` is the PRD source for App Store Connect privacy labels and must match the implemented legal/consent behavior before Epic 05 submission packaging. After consent and legal surfaces land, release copy must reflect actual data collection across Clerk, the app API, Supabase, Trigger.dev, OpenAI, Modal-hosted Darija ASR, and optional TTS. This task closes Epic 01 by making disclosure, copy, and privacy-label inputs consistent.

## Implementation

Update `ai_docs/prd/app-store-release-readiness/12-app-store-privacy-data-inventory.md` after implementation, using `references/privacy-inventory-release-copy-anchors.md` and App Store privacy guidance. Review copy in `app/signup.tsx`, `app/account.tsx`, the new legal/consent surfaces, and any consent strings in `app/translate.tsx`. Confirm collected/linked/tracking answers for email, Clerk user ID, audio, transcripts, translations, filenames, generated TTS artifacts, diagnostics, usage data, device identifiers, and sensitive user-provided content. Record unresolved release-owner questions as Epic 05 blockers.

## Acceptance Criteria

- [ ] Privacy inventory reflects actual app, server, storage, Trigger.dev, OpenAI, Modal, Clerk, Supabase, and TTS behavior.
- [ ] Release copy avoids QA wording, accuracy overclaims, deletion overclaims, and claims that server-stored data is "not collected."
- [ ] App Store privacy-label inputs can be derived directly from the inventory without re-reading implementation code.
- [ ] Unresolved provider-retention, support URL, deletion URL, production-resource, or device-identifier questions are recorded as explicit blockers for Epic 05.
- [ ] No evidence artifact includes secrets, private audio contents, full transcripts, generated audio bytes, or Clerk session tokens.

## Dependencies

- Depends On: `gate-first-audio-submit-on-consent`
- Blocks: `05-app-store-submission-package-and-testflight-evidence/fill-privacy-labels-from-inventory`
- Blocks: `05-app-store-submission-package-and-testflight-evidence/draft-store-metadata-and-reviewer-notes`

## Technical Notes

- Apple privacy guidance requires disclosure of data collected by the app and third-party partners, even when data is used only for app functionality.
- `app/signup.tsx` currently contains QA-oriented release copy and a broad processing acknowledgement; update those only after consent and legal links exist.
- `app/translate.tsx` and `app/history.tsx` expose diagnostics/provider details today; production visibility changes are owned by Epic 04, but inventory should still classify backend-retained data.
- Re-open this task if later epics add analytics, new auth providers, new AI providers, new data categories, or material pipeline behavior changes.

## Artifact Slots

- `artifacts/privacy-inventory-change-summary.md`: execution-time summary of inventory and copy changes.
- `references/privacy-inventory-release-copy-anchors.md`: PRD, code, and Apple source anchors for privacy labels.
- `resources/app-store-privacy-label-checklist.md`: mapping checklist for App Store Connect answers.
- `notes/release-copy-blockers.md`: unresolved release-owner decisions and Epic 05 blockers.
