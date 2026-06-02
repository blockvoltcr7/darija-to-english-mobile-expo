# Production Privacy Release Gates

This file tracks the practical release gates that must remain true before public App Store submission. It complements `12-app-store-privacy-data-inventory.md`; the inventory is the data-label source of truth, while this file records implementation status.

## Gate Status

| Gate | Status | Evidence | Remaining Action |
| --- | --- | --- | --- |
| App Store privacy labels match the real data inventory. | Partially implemented | `12-app-store-privacy-data-inventory.md` lists data categories, third-party processors, retention notes, deletion mapping, and public policy URLs. | Release owner must enter and publish matching labels in App Store Connect before submission. Re-open the inventory if production dependencies, logging, analytics, or retention behavior changes. |
| Account deletion is easy for reviewers to find and test. | Implemented in app/API | Account screen exposes `Delete account`; mobile calls `DELETE /v1/account`; server deletes/anonymizes Convex app data before deleting the Clerk user. | QA with a disposable reviewer-style Clerk account and record sanitized evidence that sign-in/history/playback no longer work after deletion. |
| Consent withdrawal blocks new AI processing. | Implemented in app/API/Convex | Account screen exposes `Withdraw AI consent`; server returns `403 consent_required` via `requireCurrentConsent`; Convex `translations:createTranslationJob` rejects missing, revoked, or outdated consent. | Keep revoked-consent negative-path QA in every release candidate. |
| Support page includes enough contact identity for launch regions. | Implemented for US-style MVP contact; conditional for broader regions | Hosted Support page lists the app name, developer/operator name, support email, privacy/deletion support purpose, and links to policies. | Before broad non-US distribution, confirm whether target regions require a postal address, phone number, company registration details, or additional legal representative details. |
| Retention copy stays conservative. | Implemented | Privacy, AI Processing, Data Deletion, consent copy, and in-app legal text describe app-side ephemeral defaults and provider-side logs/backups/security/legal retention limits. | Do not change copy to claim zero provider retention unless provider settings/contracts prove that claim. |

## Reviewer Notes Draft

Use these points in App Review notes after production runtime is verified:

- Privacy policy: `https://darija-to-english-legal.pages.dev/privacy`
- Support URL: `https://darija-to-english-legal.pages.dev/support`
- Account deletion path: sign in, open Account, tap Delete account, confirm deletion.
- AI consent path: new users must accept Privacy & AI Processing Consent before recording/uploading/generating audio.
- Consent withdrawal path: Account > Withdraw AI consent blocks translation and reply generation until consent is accepted again.
