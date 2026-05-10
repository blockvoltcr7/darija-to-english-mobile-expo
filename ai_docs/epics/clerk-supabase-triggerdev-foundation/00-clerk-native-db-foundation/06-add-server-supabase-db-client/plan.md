---
phase: 4
worktree_mode: parallel
conflict_risk: medium
branch: feat/clerk-06-add-server-supabase-db-client
depends_on: [add-server-env-contract, create-clerk-native-profiles-migration]
blocks: [add-foundation-verification-docs]
---

# Execution Strategy - add-server-supabase-db-client

Phase 4 can run in parallel with `add-db-local-updated-at-trigger` after both the env contract and Clerk-native profile migration are in place. This task adds the server-only Supabase client module and dependency wiring for later profile sync and persistence epics.

Conflict risk is medium because it touches shared package files and may lightly touch `server/index.mjs` for health or smoke status. It must import config only from `server/env.mjs`, target `https://npjsersrmvltoxmqdkzd.supabase.co`, disable auth session persistence, and keep `server/db.mjs` out of all mobile import paths.
