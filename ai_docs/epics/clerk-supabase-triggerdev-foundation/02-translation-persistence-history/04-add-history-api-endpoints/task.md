# Task 04: Add History API Endpoints

## Type

Code

## Context

Users need server-mediated access to their own translation history. The API must filter by the authenticated Clerk user ID.

## Implementation

- Add `GET /v1/translations`.
- Add `GET /v1/translations/:id`.
- Require Clerk session for both endpoints.
- Query only rows owned by authenticated `clerk_user_id`.

## Acceptance Criteria

- Unauthenticated requests are rejected.
- A user can list and view their own translations.
- A user cannot fetch another user's job/result.

## Dependencies

- Depends On: persist-sync-translation-results

## Technical Notes

- Keep mobile-to-Supabase direct access out of scope.
- Response should be stable enough for a minimal history UI.

## Artifact Slots

- `artifacts/`: endpoint response examples.
- `references/`: API contract notes.
- `resources/`: curl commands.
- `notes/`: response-shape decisions.
