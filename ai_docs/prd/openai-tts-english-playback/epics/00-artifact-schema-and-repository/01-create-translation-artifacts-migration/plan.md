---
phase: 1
worktree_mode: main
conflict_risk: low
branch: feat/artifact-01-translation-artifacts-migration
depends_on: []
blocks: [add-artifact-repository-helpers]
---

# Execution Strategy - create-translation-artifacts-migration

Phase 1 establishes the durable artifact table before any repository, provider, pipeline, API, or mobile playback work starts. Run this first on the main task branch and verify the live `public.translation_jobs(id)` type before writing the foreign key.

Conflict risk is low because the primary write is a new Supabase migration file. The important sequencing risk is not merge conflict; it is schema contract drift. Keep RLS server-mediated, grant access only to `service_role`, and do not introduce direct mobile access to generated audio metadata.
