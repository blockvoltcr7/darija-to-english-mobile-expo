---
phase: 1
worktree_mode: main
conflict_risk: low
branch: feat/translation-01-schema
depends_on: []
blocks: [create-translation-db-writers, persist-sync-translation-results, add-history-api-endpoints]
---

# Execution Strategy - create-translation-schema

Phase 1. This task starts Epic 02 after the external prerequisite
`01-clerk-profile-sync/verify-profile-sync-end-to-end`, which is already done.
It should add one new SQL migration under `supabase/migrations/` and apply or
verify the live schema through Supabase MCP against project
`npjsersrmvltoxmqdkzd`.

Keep the write scope focused on the schema layer: `translation_jobs`,
`translation_results`, and `provider_runs`. Do not touch route behavior,
mobile code, Trigger.dev, or Supabase Storage in this task. The schema must stay
Clerk-native, with `clerk_user_id` as the ownership key and no references to
`auth.users` or `auth.uid()`.

Conflict risk is low because this task should create a new migration file and
use existing database conventions. It blocks all code that writes or reads
translation history.
