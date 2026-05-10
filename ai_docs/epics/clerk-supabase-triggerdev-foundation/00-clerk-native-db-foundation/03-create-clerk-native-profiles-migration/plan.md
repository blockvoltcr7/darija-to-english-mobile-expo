---
phase: 3
worktree_mode: main
conflict_risk: high
branch: feat/clerk-03-create-clerk-native-profiles-migration
depends_on: [retire-supabase-auth-profile-shape]
blocks: [add-db-local-updated-at-trigger, add-server-supabase-db-client]
---

# Execution Strategy - create-clerk-native-profiles-migration

Phase 3 should run sequentially on the main task branch. It is the schema pivot for Epic 00 and must consume the Task 02 retirement decision before writing destructive SQL.

Conflict risk is high because the task may replace `public.profiles`, remove old Supabase Auth profile artifacts, and define the table shape that later trigger and server-client work verify against. Use `supabase migration new create_clerk_native_profiles`, keep all live CLI/MCP work targeted at `npjsersrmvltoxmqdkzd`, and stop if Task 02 finds existing rows without an approved backup or mapping plan.
