# Task 02: Add Storage Metadata To Jobs

## Type

Migration

## Context

`translation_jobs` needs to reference private storage objects by bucket/key and support retention cleanup.

## Implementation

- Add `audio_bucket`, `audio_object_key`, `audio_size_bytes`, `mime_type`, `retention_expires_at`, and `audio_deleted_at` to `translation_jobs`.
- Document the object key format: `users/<clerk_user_id>/jobs/<job_id>/original.<ext>`.

## Acceptance Criteria

- Job rows can reference original audio objects.
- Audio bytes are not stored in Postgres.
- Retention metadata exists for cleanup.

## Dependencies

- Depends On: create-private-storage-buckets

## Technical Notes

- Use nullable fields if preserving sync endpoint compatibility during rollout.
- Reference the storage diagram.

## Artifact Slots

- `artifacts/`: migration SQL and schema check output.
- `references/`: storage diagram.
- `resources/`: SQL inspection commands.
- `notes/`: retention field decisions.
