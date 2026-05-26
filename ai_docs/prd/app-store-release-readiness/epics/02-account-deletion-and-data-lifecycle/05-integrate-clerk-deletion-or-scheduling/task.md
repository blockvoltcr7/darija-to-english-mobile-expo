# Integrate Clerk Deletion Or Scheduling

## Type

Code

## Context

The existing server handles Clerk deletion webhooks after the fact, but App Store readiness requires an in-app initiation path. The server must either delete the Clerk account or schedule deletion according to a verified Clerk-supported flow.

## Implementation

- Decide whether the app can delete Clerk users directly from the server or must schedule/manual-confirm deletion.
- Integrate the chosen Clerk flow after app-owned data cleanup succeeds or reaches the accepted policy state.
- Handle reauthentication-required behavior if Clerk requires a recent session or user action.
- Ensure `user.deleted` webhook behavior remains compatible and idempotent.
- Return Clerk deletion state in the account deletion response without exposing secrets or private account internals.

## Acceptance Criteria

- Clerk account deletion or scheduling behavior is documented and implemented.
- Webhook handling remains idempotent if Clerk later emits `user.deleted`.
- API responses tell the app whether deletion is complete, scheduled, or blocked by reauthentication.
- Failure modes do not leave ambiguous UI messaging.

## Dependencies

- Depends On: add-user-data-and-storage-cleanup

## Technical Notes

- Keep Clerk secret key usage server-side only.
- If immediate deletion is not possible, the policy and UI must clearly describe scheduling and expected next steps.

## Artifact Slots

- `artifacts/`: Clerk deletion decision and response-state matrix
- `references/`: Clerk integration and webhook anchors
- `resources/`: safe test plan for Clerk test users
- `notes/`: release-owner account-management decisions

