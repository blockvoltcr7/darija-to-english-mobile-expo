# Task 01: Define Convex Schema

## Type

Code

## Context

The Supabase tables map to Convex document tables. Convex `_id` becomes the internal join key, while existing Supabase UUIDs should remain as `publicId` or `legacySupabaseId` for compatibility and backfill.

## Implementation

- Create tables for `profiles`, `clerkWebhookEvents`, `translationJobs`, `translationResults`, `providerRuns`, and optional `translationArtifacts`.
- Add indexes by Clerk user, public job ID, status, created time, webhook event ID, trigger run ID, and retention time.
- Store timestamps consistently as numbers or ISO strings and document the boundary conversion.
- Add status validators for queued/running/retrying/succeeded/failed/canceled/expired.

## Acceptance Criteria

- Schema can represent all current Supabase app data.
- Indexes support history list, detail lookup, worker claim, trigger run lookup, and retention cleanup.
- Legacy UUID compatibility is preserved.
- `npx convex dev` succeeds.

## Dependencies

- Epic 01 complete.

## Validation Commands

```bash
npx convex dev
npm run typecheck
```

## Artifact Slots

- `references/`: old-to-new field mapping.
- `notes/`: timestamp representation decision.

