# Privacy Inventory And Release Copy Anchors

## Local Source Anchors

- `ai_docs/prd/app-store-release-readiness/12-app-store-privacy-data-inventory.md`: source of truth for privacy labels.
- `ai_docs/prd/app-store-release-readiness/07-ui-and-store-metadata-changes.md`: signup/account/translation/history copy targets and reviewer-note language.
- `app/signup.tsx`: current signup subtitle mentions fresh-user QA, and the checkbox has broad audio-processing acknowledgement.
- `app/translate.tsx`: currently shows API target, API URL, diagnostics, raw provider transcripts, and model metadata.
- `app/history.tsx`: currently shows provider operation/status details in history detail.
- `server/AGENTS.md`: provider calls, private storage, and no-secret/no-transcript logging rules.
- `supabase/migrations/20260510202655_create_translation_persistence_tables.sql`: user-linked jobs, results, provider runs, and safe metadata.
- `supabase/migrations/20260521204700_create_translation_artifacts.sql`: generated English TTS audio artifact metadata.

## App Store Privacy Source Anchors

- Apple App Privacy Details: https://developer.apple.com/app-store/app-privacy-details/
- App Store Connect privacy management: https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy

## Review Reminders

- Server-stored data is still collected even if production UI hides diagnostics or raw provider details.
- Audio/transcripts/translations are user content linked to Clerk user identity.
- The current PRD does not introduce advertising tracking. Re-open the inventory if analytics, advertising, or data-broker sharing is added.
- Device identifiers remain a review item until final dependency/privacy manifest and upload warnings are checked.
