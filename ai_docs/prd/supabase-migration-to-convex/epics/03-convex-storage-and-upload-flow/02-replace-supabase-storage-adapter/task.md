# Task 02: Replace Supabase Storage Adapter

## Type

Code

## Context

The current server storage adapter uploads, downloads, and removes Supabase objects. The worker needs equivalent access to Convex-stored audio.

## Implementation

- Replace Supabase bucket/object fields with Convex storage IDs.
- Add worker-safe audio download by storage ID.
- Preserve retention metadata and deletion timestamps.
- Keep legacy Supabase bucket/object fields only for backfill or retention bridge rows.
- Ensure logs print object metadata, not audio content.

## Acceptance Criteria

- New uploads no longer use Supabase Storage.
- Worker can read Convex-stored audio.
- Deletion/retention metadata is represented.
- Private audio is not exposed through public URLs.

## Dependencies

- `create-upload-url-flow`

## Validation Commands

```bash
node --check server/index.mjs
npm run typecheck
npm run lint
```

## Artifact Slots

- `artifacts/`: storage adapter parity checklist.
- `notes/`: retention cleanup gaps.

