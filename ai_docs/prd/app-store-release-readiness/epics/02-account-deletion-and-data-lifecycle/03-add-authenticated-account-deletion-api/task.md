# Add Authenticated Account Deletion API

## Type

Code

## Context

The app has Clerk `user.deleted` webhook handling, but no authenticated API that lets a signed-in user initiate deletion from the app. The PRD prefers `DELETE /v1/account`.

## Implementation

- Add an authenticated account deletion route such as `DELETE /v1/account`.
- Verify the Clerk session and derive `clerk_user_id` from the session.
- Accept a minimal request body such as confirmation text, optional reason, and deletion preference flags.
- Return a safe response with status, deletion counts, Clerk deletion state, and trace ID.
- Add structured error responses for confirmation mismatch, reauthentication required, partial cleanup failure, and unexpected failure.

## Acceptance Criteria

- Endpoint rejects missing, invalid, or cross-user auth.
- Endpoint never accepts a client-supplied `clerk_user_id` as authority.
- Response contains safe metadata only, with no private audio bytes, transcript text, or secret values.
- Route is wired through `server/index.mjs` or a focused account module.

## Dependencies

- Depends On: map-account-deletion-policy-to-data

## Technical Notes

- Prefer a dedicated module such as `server/account.mjs` if that matches the implementation shape.
- Add route-level logs with safe IDs/statuses only.

## Artifact Slots

- `artifacts/`: API contract and redacted response examples
- `references/`: server route and auth-helper anchors
- `resources/`: curl examples with placeholder bearer tokens
- `notes/`: partial-failure handling decisions

