# Task 04: Add Convex Health Check

## Type

Code

## Context

The existing API health response reports provider and persistence readiness. During migration it must report Convex without removing model metadata.

## Implementation

- Add a server-side Convex client.
- Add a lightweight Convex connectivity check.
- Update `/health` to include Convex readiness.
- Add or replace `/health/supabase` with `/health/convex`.
- Preserve model fields for OpenAI transcription, consolidation, and translation.

## Acceptance Criteria

- `curl http://localhost:8787/health` reports Convex status.
- Health output does not include secrets.
- Existing model metadata remains present.
- Supabase health remains only if Supabase is still actively used.

## Dependencies

- `configure-clerk-jwt-auth`

## Validation Commands

```bash
node --check server/index.mjs
npm run api
curl http://localhost:8787/health
```

## Artifact Slots

- `artifacts/`: sanitized health response.
- `notes/`: transient Convex connectivity failures.

