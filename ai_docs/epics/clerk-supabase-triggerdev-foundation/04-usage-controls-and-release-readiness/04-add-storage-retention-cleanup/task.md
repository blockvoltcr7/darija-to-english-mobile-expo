# Task 04: Add Storage Retention Cleanup

## Type

Code

## Context

Private bucket audio should not be retained forever by default. Retention should be driven by job metadata and account deletion flows.

## Implementation

- Implement or document cleanup for expired audio and artifacts.
- Use `retention_expires_at` and update `audio_deleted_at`.
- Include handling for failed abandoned jobs.

## Acceptance Criteria

- Expired audio/artifact objects can be identified.
- Cleanup updates deletion metadata.
- Cleanup does not delete active job files.

## Dependencies

- Depends On: 03-storage-and-triggerdev-workflow/verify-async-job-flow

## Technical Notes

- Reference: `ai_docs/visuals/clerk-supabase-triggerdev-foundation/05-supabase-storage-retention.png`.
- This can be a documented job plan if implementation timing is deferred.

## Artifact Slots

- `artifacts/`: cleanup logs or dry-run output.
- `references/`: storage retention diagram.
- `resources/`: cleanup commands/scripts.
- `notes/`: retention window decisions.
