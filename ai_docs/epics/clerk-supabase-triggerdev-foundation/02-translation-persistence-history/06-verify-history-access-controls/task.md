# Task 06: Verify History Access Controls

## Type

Code

## Context

Translation history contains user-owned transcripts and must be protected server-side.

## Implementation

- Verify unauthenticated history requests return 401.
- Verify authenticated requests are filtered by `clerk_user_id`.
- Attempt cross-user access and confirm it is rejected or returns not found.

## Acceptance Criteria

- Unauthenticated history list/detail calls fail.
- Authenticated users only see their own rows.
- Cross-user detail access is not possible.

## Dependencies

- Depends On: add-history-api-endpoints

## Technical Notes

- Capture manual test evidence in `artifacts/`.
- Include test users only as safe placeholders.

## Artifact Slots

- `artifacts/`: curl outputs and DB query evidence.
- `references/`: access-control checklist.
- `resources/`: test command templates.
- `notes/`: QA findings and blockers.
