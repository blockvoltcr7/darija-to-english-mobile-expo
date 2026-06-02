# Replace QA And Permission Copy

## Type

UI

## Context

The PRD and evaluator report call out two public-release copy risks: `app/signup.tsx` says "fresh-user QA", and `app.json` uses the generic iOS microphone prompt "Allow Darija to English to record audio." App Review and users should see product-purpose copy, AI/audio processing disclosure, and accuracy limitations that match the legal/privacy work from Epic 01.

## Implementation

Update copy using `references/release-copy-source-anchors.md`. Replace the signup subtitle in `app/signup.tsx` with the PRD target "Create an account to save translations, review history, and manage your data." Review `app/translate.tsx`, `app/account.tsx`, `app/history.tsx`, `app/index.tsx`, and legal/consent surfaces from Epic 01 for QA/debug wording. Update `app.json` `expo-audio.microphonePermission` to explain recording for Moroccan Darija transcription and English translation. Keep AI limitation/provider-retention wording aligned with `12-app-store-privacy-data-inventory.md`.

## Acceptance Criteria

- [ ] Production-facing screens contain no "QA", "fresh-user QA", internal provider-operation, or beta-only wording unless diagnostics/support mode is explicitly enabled.
- [ ] `app.json` microphone permission copy is product-specific and explains recording for Darija transcription and English translation.
- [ ] Signup/account/legal/consent copy discloses audio processing and AI limitations without overclaiming accuracy or third-party provider deletion guarantees.
- [ ] Copy remains consistent with Epic 01 legal URLs, consent version, privacy inventory, and reviewer-note language.
- [ ] The task records that microphone permission copy changes require a new iOS binary path, not an OTA-only update.

## Dependencies

- Depends On: `hide-production-diagnostics-and-provider-internals`
- Depends On: `01-legal-privacy-and-consent/add-in-app-legal-surfaces`
- Depends On: `01-legal-privacy-and-consent/update-privacy-inventory-and-release-copy`
- Blocks: `verify-record-upload-playback-and-permission-states`
- Blocks: `05-app-store-submission-package-and-testflight-evidence/draft-store-metadata-and-reviewer-notes`

## Technical Notes

- Current copy anchors: `app/signup.tsx` subtitle and processing checkbox; `app.json` `expo-audio.microphonePermission`; translate/history/account text visible in release UI.
- The evaluator-recommended permission direction is: record audio so the app can transcribe Moroccan Darija and translate it to English.
- `expo-audio` permission copy is native configuration; plan for a rebuilt iOS binary before clean-install permission-prompt verification.
- Avoid promising exact translation quality, legal advice, medical accuracy, provider-side deletion, or zero retention unless the legal/provider setup explicitly supports it.

## Artifact Slots

- `artifacts/copy-change-summary.md`: execution-time summary of changed strings and final permission prompt evidence.
- `references/release-copy-source-anchors.md`: PRD/code/official documentation anchors for public copy and permission wording.
- `resources/clean-install-permission-copy-qa.md`: clean-install permission verification recipe.
- `notes/copy-decisions.md`: release-owner wording decisions and unresolved legal/privacy copy questions.
