# Legal Policy Scope References

## Local PRD Anchors

- `ai_docs/prd/app-store-release-readiness/06-technical-specifications.md`: public legal URL env contract and AI processing consent data categories.
- `ai_docs/prd/app-store-release-readiness/12-app-store-privacy-data-inventory.md`: source data categories, processors, deletion mapping, and release-owner questions.
- `ai_docs/prd/app-store-release-readiness/13-epic-enrichment-plan.md`: Epic 01 legal/consent acceptance evidence and no-go gates.
- `ai_docs/prd/app-store-release-readiness/11-definition-of-done.md`: public legal links and first-submit consent are required release criteria.

## Code/Data Anchors

- `app/signup.tsx`: currently has only a broad acknowledgement that uploaded audio is processed to produce transcripts and translations.
- `supabase/migrations/20260510202655_create_translation_persistence_tables.sql`: translation jobs/results/provider runs store user-linked audio metadata, transcripts, translations, provider metadata, and trace IDs.
- `supabase/migrations/20260521204700_create_translation_artifacts.sql`: generated English TTS audio artifacts are private user data and must not be exposed directly.
- `server/AGENTS.md`: confirms provider calls and storage stay server-side and full transcripts/audio bytes must not be logged.

## Official Source Anchors

- Apple App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Apple account deletion support: https://developer.apple.com/support/offering-account-deletion-in-your-app/
- Apple App Privacy Details: https://developer.apple.com/app-store/app-privacy-details/
- App Store Connect privacy management: https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy

## Policy Boundary Notes

- Disclose app-owned deletion for profile, job rows, transcripts, translations, original audio, generated audio artifacts, and minimal audit/support metadata.
- Do not promise deletion from OpenAI, Modal, Clerk, Supabase, Trigger.dev, or infrastructure logs beyond what the release owner has verified in those providers' terms/settings.
- Treat original audio, transcripts, translations, and generated TTS audio as user data linked to Clerk identity.
