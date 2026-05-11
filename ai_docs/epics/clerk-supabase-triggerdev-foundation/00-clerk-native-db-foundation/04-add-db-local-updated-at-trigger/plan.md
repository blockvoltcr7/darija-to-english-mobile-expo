---
phase: 4
worktree_mode: parallel
conflict_risk: low
branch: feat/clerk-04-add-db-local-updated-at-trigger
depends_on: [create-clerk-native-profiles-migration]
blocks: [add-foundation-verification-docs]
---

# Execution Strategy - add-db-local-updated-at-trigger

Phase 4 can run in parallel with `add-server-supabase-db-client` after the Clerk-native profiles migration exists. This task owns only the reusable `public.set_updated_at()` function and the first `public.profiles` trigger attachment.

Conflict risk is low because the expected write set is a new migration plus task-local verification artifacts. Keep the trigger database-local: no `auth.users` trigger, no Clerk lifecycle logic, and no recreation of the old `public.handle_new_user()` flow.
