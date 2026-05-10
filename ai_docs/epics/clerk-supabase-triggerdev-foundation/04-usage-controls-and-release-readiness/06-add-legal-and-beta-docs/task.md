# Task 06: Add Legal And Beta Docs

## Type

Code

## Context

Beta readiness requires user-facing policy docs that match the actual data, retention, and deletion behavior.

## Implementation

- Add or update:
  - `docs/legal/privacy-policy.md`
  - `docs/legal/terms.md`
  - `docs/legal/support.md`
  - `docs/legal/delete-account.md`
  - `docs/beta-test-plan.md`
- Include audio/transcript retention, account deletion, support contact, and app-scope disclaimers.

## Acceptance Criteria

- Legal and beta docs exist.
- Docs explain audio/transcript retention and account deletion.
- Docs avoid legal, medical, emergency, or government-service overclaims.

## Dependencies

- Depends On: add-account-deletion-data-flow

## Technical Notes

- Keep language aligned with actual implementation.
- Do not add subscription terms until billing is implemented.

## Artifact Slots

- `artifacts/`: review notes or published doc links.
- `references/`: product scope and retention notes.
- `resources/`: app review checklist.
- `notes/`: wording decisions.
