# Add User Data And Storage Cleanup

## Type

Code

## Context

Account deletion must clean or anonymize app-owned profile state, translation rows, provider metadata, original audio, and generated artifacts. Deleting only Clerk or profile rows would leave private storage and history behind.

## Implementation

- Add deletion/anonymization helpers in the appropriate modules, likely `server/profiles.mjs`, `server/translations.mjs`, `server/storage.mjs`, and artifact helpers.
- Locate all user-owned translation jobs and generated artifacts for the authenticated Clerk user.
- Delete original audio objects and generated TTS artifacts from private Supabase Storage.
- Delete, soft-delete, or anonymize rows according to the policy mapping.
- Record minimal audit-safe evidence that excludes content, transcript text, audio bytes, and object payloads.

## Acceptance Criteria

- Cleanup covers profile, jobs/results, provider metadata, original audio objects, generated artifacts, and artifact metadata.
- Storage deletion failures are captured safely and surfaced as partial failure or retry-needed state.
- Deleted/anonymized data is no longer returned by history/detail/playback routes.
- Implementation follows the policy-to-data mapping from task 01.

## Dependencies

- Depends On: add-authenticated-account-deletion-api

## Technical Notes

- Supabase Storage cleanup should use storage APIs/helpers. SQL row cleanup alone is not enough.
- Preserve ownership checks so one user cannot trigger cleanup for another user's objects.

## Artifact Slots

- `artifacts/`: cleanup coverage matrix and sanitized deletion result example
- `references/`: storage/schema/helper anchors
- `resources/`: safe verification queries
- `notes/`: cleanup edge cases and retry decisions

