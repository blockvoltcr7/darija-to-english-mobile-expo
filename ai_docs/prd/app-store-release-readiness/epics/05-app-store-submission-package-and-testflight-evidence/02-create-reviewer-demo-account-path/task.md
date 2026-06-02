# Create Reviewer Demo Account Path

## Type

Infrastructure

## Context

App Review needs a reliable login path that does not require owner intervention, private phone numbers, or external social account access. The auth-method inventory and production runtime setup determine the safe reviewer path.

## Implementation

- Create or document the reviewer demo account flow using the approved production Clerk auth method.
- Store real credentials only in the approved secure channel, not in the repo.
- Document placeholder credentials and instructions in reviewer notes.
- Confirm the demo account can submit audio, view results, access history, and reach legal/account deletion surfaces as appropriate.
- Confirm usage limits will not block the reviewer demo path.

## Acceptance Criteria

- Reviewer demo account path is documented without committing real credentials.
- The path works with production auth methods and does not require release-owner intervention during review.
- Notes explain expected processing time and use of a short non-sensitive audio sample.
- Any account setup blockers are explicit before TestFlight/App Review submission.

## Dependencies

- Depends On: draft-store-metadata-and-reviewer-notes
- Depends On: `00-submission-baseline-and-app-store-inventory/inventory-clerk-auth-and-apple-sign-in`
- Depends On: `03-production-runtime-and-abuse-controls/run-production-smoke-test`

## Technical Notes

- If credentials must be shared with App Review, use App Store Connect reviewer fields, not committed markdown.
- Demo account should not contain private user history or sensitive sample content.

## Artifact Slots

- `artifacts/`: reviewer account path checklist with placeholder credentials
- `references/`: auth inventory and reviewer-note anchors
- `resources/`: reviewer demo QA checklist
- `notes/`: secure credential handoff decisions

