---
phase: 2
worktree_mode: parallel
conflict_risk: low
branch: feat/clerk-02-retire-supabase-auth-profile-shape
depends_on: [establish-migration-convention]
blocks: [create-clerk-native-profiles-migration]
---

# Execution Strategy - retire-supabase-auth-profile-shape

Phase 2 can run in parallel with `add-server-env-contract` after the migration convention lands. This task is primarily live read-only Supabase inspection plus a retirement decision record for the existing Supabase Auth-shaped `public.profiles` table.

Conflict risk is low because this task should not create the final Clerk-native migration or change server code. Keep all live inspection tied to Supabase project ref / MCP `project_id` `npjsersrmvltoxmqdkzd`. The output must clearly state whether `public.profiles` can be replaced in Task 03 or whether a backup and row-mapping plan is required.
