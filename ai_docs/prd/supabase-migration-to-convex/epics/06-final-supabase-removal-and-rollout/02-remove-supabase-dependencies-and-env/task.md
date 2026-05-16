# Task 02: Remove Supabase Dependencies And Env

## Type

Code

## Context

Supabase package and env removal should happen only after Convex handles production-equivalent job creation, storage, processing, history, and QA.

## Implementation

- Remove `@supabase/supabase-js` from dependencies.
- Remove Supabase env vars from `.env.example`.
- Remove unused Supabase modules and imports.
- Remove Supabase health checks.
- Keep historical migration docs only if clearly labeled as archived.

## Acceptance Criteria

- Runtime no longer requires Supabase env vars.
- `rg` finds no active Supabase code paths.
- `/health` reports Convex and provider readiness.
- Package lock is updated.

## Dependencies

- `backfill-or-retention-decision`

## Validation Commands

```bash
rg -n "SUPABASE|supabase|@supabase" --glob '!node_modules/**' --glob '!refs/**'
node --check server/index.mjs
npm run typecheck
npm run lint
curl http://localhost:8787/health
```

## Artifact Slots

- `artifacts/`: removal checklist.
- `notes/`: intentional historical references.

