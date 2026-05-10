---
phase: 1
worktree_mode: main
conflict_risk: low
branch: feat/clerk-01-establish-migration-convention
depends_on: []
blocks: [retire-supabase-auth-profile-shape, add-server-env-contract]
---

# Execution Strategy - establish-migration-convention

Phase 1 starts on the main task branch because every other Epic 00 task relies on the migration convention and Supabase project targeting rules. This task creates or documents the local `supabase/` structure, migration authoring rules, project ref requirements, and baseline-risk notes without applying schema changes.

Conflict risk is low. The expected write set is mostly new Supabase scaffold/documentation files such as `supabase/config.toml`, `supabase/migrations/`, and a migration README or equivalent note. Merge this before starting the later database and server tasks so they share the same convention.
