# Fill Privacy Labels From Inventory

## Type

Infrastructure

## Context

App Store privacy labels must match actual data flows. The PRD's `12-app-store-privacy-data-inventory.md` is the source of truth after legal, deletion, runtime, and UI tasks are complete.

## Implementation

- Review the final privacy data inventory.
- Map each collected data category to App Store Connect privacy questionnaire answers.
- Confirm linked-to-user status for email, user ID, audio, transcripts/translations, diagnostics, and usage data.
- Confirm tracking is not introduced unless a later implementation added cross-app tracking.
- Record final answers or release-owner entry checklist without storing account credentials.

## Acceptance Criteria

- Privacy-label draft matches the final data inventory.
- Audio/user content/diagnostics/usage data are not incorrectly marked as uncollected or anonymous.
- Any sensitive-info or device-ID uncertainty is resolved or marked as a blocker.
- Release owner has a clear checklist for App Store Connect entry.

## Dependencies

- Depends On: capture-production-screenshots
- Depends On: `01-legal-privacy-and-consent/update-privacy-inventory-and-release-copy`
- Depends On: `02-account-deletion-and-data-lifecycle/verify-deletion-access-denial-and-evidence`

## Technical Notes

- Hiding diagnostics in production UI does not mean backend diagnostics are not collected.
- If analytics SDKs or new providers are added later, reopen the privacy inventory before submission.

## Artifact Slots

- `artifacts/`: privacy-label answer draft and inventory mapping
- `references/`: privacy inventory anchors
- `resources/`: App Store privacy questionnaire checklist
- `notes/`: unresolved privacy-label decisions

