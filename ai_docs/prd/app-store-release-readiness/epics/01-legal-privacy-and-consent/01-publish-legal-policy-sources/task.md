# Publish Legal Policy Sources

## Type

Infrastructure

## Context

Phase 1 of the App Store release-readiness PRD requires public legal and support surfaces before production submission. Apple requires a publicly accessible Privacy Policy URL in App Store Connect, and the PRD's definition of done requires Privacy Policy, Terms of Use, Data Deletion Policy, and AI Processing Disclosure links in-app. This task creates the source-of-truth URL and policy matrix that later UI, consent, privacy-label, and reviewer-note work must use.

## Implementation

Create a policy source matrix under this task's `artifacts/` during execution, and use `references/legal-policy-scope.md` plus `ai_docs/prd/app-store-release-readiness/12-app-store-privacy-data-inventory.md` to define the content scope. Decide whether sources live in `docs/legal/` or an external host; record final public URLs for privacy, terms, deletion, AI disclosure, and support. Cover Clerk account data, private audio, transcripts, translations, generated TTS audio, diagnostics, usage records, OpenAI, Modal-hosted Darija ASR, Supabase, Trigger.dev, and provider-retention caveats.

## Acceptance Criteria

- [ ] Public URL decisions for Privacy Policy, Terms of Use, Data Deletion Policy, AI Processing Disclosure, and Support are recorded without requiring authentication.
- [ ] Policy wording covers app-owned profile/job/result/storage data and third-party AI processing by OpenAI and Modal-hosted Darija ASR.
- [ ] Deletion wording distinguishes app-owned deletion/anonymization from third-party processor retention governed by provider terms.
- [ ] App Store Connect privacy/support URL requirements can be filled from the recorded matrix.
- [ ] No secrets, private audio contents, full transcripts, provider account internals, or `.env` values appear in the policy source artifacts.

## Dependencies

- Depends On: `00-submission-baseline-and-app-store-inventory/write-submission-baseline-evidence`
- Blocks: `add-in-app-legal-surfaces`
- Blocks: `add-consent-persistence`
- Blocks: `update-privacy-inventory-and-release-copy`

## Technical Notes

- PRD anchors: `06-technical-specifications.md` release env/legal URL contract and AI consent section; `12-app-store-privacy-data-inventory.md` data categories and processors; `13-epic-enrichment-plan.md` Epic 01 no-go gates.
- Current app has signup acknowledgement copy in `app/signup.tsx`, but no public legal URL source or in-app legal screen yet.
- Apple App Store privacy guidance treats the privacy policy URL as required for iOS and requires disclosure of data collected by the app and third-party partners.
- Keep this task documentation-only unless the chosen source location is repo-local `docs/legal/`; do not wire mobile UI links here.

## Artifact Slots

- `artifacts/legal-url-matrix.md`: execution-time matrix of policy/support surfaces, owners, public URLs, and launch blockers.
- `references/legal-policy-scope.md`: PRD, code, and Apple source anchors for policy content.
- `resources/legal-url-validation-checklist.md`: repeatable URL and content validation checklist.
- `notes/legal-review-questions.md`: release-owner/legal questions that remain unresolved.
