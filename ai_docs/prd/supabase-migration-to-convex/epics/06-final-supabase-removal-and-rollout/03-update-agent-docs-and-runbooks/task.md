# Task 03: Update Agent Docs And Runbooks

## Type

Docs

## Context

After migration, repo guidance must describe Convex as the app state and storage system. Old Supabase instructions will mislead future agents.

## Implementation

- Update root `AGENTS.md`.
- Update `app/AGENTS.md`, `lib/AGENTS.md`, and server/trigger guidance.
- Add or update Convex local development commands.
- Update QA playbooks to start Convex dev.
- Preserve no-secret and private-audio rules.

## Acceptance Criteria

- Docs match the new runtime.
- Fresh setup commands mention Convex.
- Supabase is absent from active workflow docs.
- Verification commands are current.

## Dependencies

- `remove-supabase-dependencies-and-env`

## Validation Commands

```bash
rg -n "SUPABASE|supabase|@supabase|Convex|convex" AGENTS.md app lib server trigger ai_docs .env.example package.json
```

## Artifact Slots

- `artifacts/`: docs update summary.
- `notes/`: docs intentionally deferred.

