---
phase: 2
worktree_mode: parallel
conflict_risk: medium
branch: feat/clerk-05-add-server-env-contract
depends_on: [establish-migration-convention]
blocks: [add-server-supabase-db-client]
---

# Execution Strategy - add-server-env-contract

Phase 2 can run in parallel with `retire-supabase-auth-profile-shape` after the migration convention lands. This task creates the server-only env boundary that later Supabase DB client work must consume.

Conflict risk is medium because it modifies shared server startup/config surfaces such as `server/index.mjs` and `.env.example`. Keep mobile public config separate, preserve existing Clerk/OpenAI/Darija defaults, and ensure the Supabase backend URL points at project ref `npjsersrmvltoxmqdkzd` without exposing secret keys through `EXPO_PUBLIC_*`.
