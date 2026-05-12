# Task 02: Verify History Isolation

## Type

Code

## Context

Fresh-user QA must verify user-scoped data isolation. A new Clerk user should not see translations from a previous account.

## Implementation

- After signing in as the fresh Clerk test user, open History.
- Confirm previous user rows are absent.
- If the new user has no translations, confirm empty state behaves correctly.
- If seeded test data is intentionally present, confirm it belongs to the current Clerk user.
- Check API logs for authenticated user/profile resolution where available.

## Acceptance Criteria

- Fresh user does not see previous user rows.
- History loading reaches a terminal UI state rather than hanging indefinitely.
- Any unexpected row is investigated before audio E2E continues.
- Evidence captures user-scoping result without revealing private transcripts unnecessarily.

## Dependencies

- Depends On: run-fresh-clerk-user-auth-qa

## Technical Notes

- This task verifies the prior auth/state isolation work under production-like conditions.
- If History hangs, inspect API response, token refresh, and loading-state handling.

## Artifact Slots

- `artifacts/`: screenshot and API/history evidence.
- `references/`: history endpoint contract excerpts.
- `resources/`: history verification checklist.
- `notes/`: isolation findings and blockers.

