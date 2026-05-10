# Task 01: Create Private Storage Buckets

## Type

Infrastructure

## Context

Original audio and generated artifacts should live in private Supabase buckets, not in Postgres and not in mobile-accessible public storage.

## Implementation

- Define private `audio-originals` and `translation-artifacts` buckets.
- Document creation steps and access expectations.
- Keep broad bucket credentials server-side only.

## Acceptance Criteria

- Bucket definitions are documented.
- Buckets are private.
- Server and Trigger.dev access is planned through server-side credentials.
- Mobile does not receive broad bucket credentials.

## Dependencies

- Depends On: 02-translation-persistence-history/verify-history-access-controls

## Technical Notes

- Reference: `ai_docs/visuals/clerk-supabase-triggerdev-foundation/05-supabase-storage-retention.png`.

## Artifact Slots

- `artifacts/`: bucket creation evidence.
- `references/`: storage diagram and Supabase bucket docs.
- `resources/`: bucket setup commands.
- `notes/`: access policy decisions.
