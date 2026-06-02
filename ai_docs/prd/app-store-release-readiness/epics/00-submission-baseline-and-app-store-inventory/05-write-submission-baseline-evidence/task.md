# Write Submission Baseline Evidence

## Type

Infrastructure

## Context

Epic 00 exits only when downstream epics have a single sanitized source of truth for app identity, native config, EAS lanes, production submit strategy, Clerk auth/Apple sign-in decision, encryption export assumption, tablet scope, and OTA policy. The PRD definition of done requires these decisions before production runtime, legal/consent, UI readiness, privacy labels, and final App Store submission can be planned safely. This task consolidates the prior Epic 00 artifacts; it must not fabricate dashboard evidence or execution results.

## Implementation

Create a submission baseline evidence artifact using `resources/submission-baseline-template.md`. Summarize and link the outputs from Tasks 01-04, then add downstream implications for Epics 01-05. Keep confirmed facts separate from assumptions and release-owner decisions. Include a redaction section covering secrets, tokens, private audio, full transcripts, Apple credential material, Clerk private data, and account screenshots. Add an unresolved-decision table with owner and required next check. If any prerequisite artifact is missing or unaccepted, mark Epic 00 blocked rather than filling the baseline from guesses.

## Acceptance Criteria

- [ ] A sanitized submission baseline evidence document is written under `artifacts/`.
- [ ] Baseline references the Task 01-04 artifacts and source PRD/config anchors without duplicating sensitive account data.
- [ ] Baseline includes downstream implications for legal/consent, account deletion, production runtime, production UI/native readiness, and final submission/TestFlight evidence.
- [ ] Open questions are listed with owner, blocker status, and required next check.
- [ ] The document contains no `.env` values, API keys, Clerk tokens, Apple credential material, private account data, full transcripts, private audio details, or generated audio bytes.
- [ ] Epic 00 is marked ready for downstream planning only if the release owner accepts the baseline; otherwise the blocker is explicit.

## Dependencies

- Depends On: `inventory-ios-config-and-runtime`
- Depends On: `decide-production-submit-and-credentials`
- Depends On: `inventory-clerk-auth-and-apple-sign-in`
- Depends On: `confirm-encryption-tablet-and-ota-policy`
- Blocks: `01-legal-privacy-and-consent`
- Blocks: `02-account-deletion-and-data-lifecycle`
- Blocks: `03-production-runtime-and-abuse-controls`
- Blocks: `04-production-ios-ui-and-native-readiness`
- Blocks: `05-app-store-submission-package-and-testflight-evidence`

## Technical Notes

- Prefer a matrix format: area, confirmed source, decision, evidence path, downstream impact, owner, and status.
- Use `ai_docs/prd/app-store-release-readiness/11-definition-of-done.md` as the release-gate checklist and `12-app-store-privacy-data-inventory.md` as privacy-label context.
- Do not include plan summaries from `plan.md` or execution status files; `analyze-epic`, `prepare-epic`, and `run-epic-codex` own those surfaces.
- If production API/runtime remains deferred, state that public release remains blocked rather than softening the gate.

## Artifact Slots

- `artifacts/`: sanitized submission baseline evidence document and optional release-owner acceptance note
- `references/`: source PRD, config, deployment, and official-doc anchors used in the baseline
- `resources/`: baseline evidence template and redaction checklist
- `notes/`: release-owner signoff notes, unresolved blockers, and downstream handoff cautions
