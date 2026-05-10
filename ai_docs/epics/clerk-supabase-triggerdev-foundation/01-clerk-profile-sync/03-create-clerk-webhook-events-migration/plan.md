---
phase: 1
worktree_mode: parallel
conflict_risk: low
branch: feat/clerk-03-webhook-events-migration
depends_on: []
blocks: [add-clerk-webhook-endpoint]
---

# Execution Strategy - create-clerk-webhook-events-migration

Phase 1. This can run in parallel with `add-profile-repository-helpers` because
it should add a new migration file under `supabase/migrations/` and apply the
schema through Supabase MCP, while the helper task owns server repository code.

Use production Supabase MCP only, targeting project `npjsersrmvltoxmqdkzd`.
Do not use a local Supabase stack. The committed migration and live schema must
match, and the table should remain server-owned with RLS enabled and no broad
client-facing policies.

This task blocks `add-clerk-webhook-endpoint`, which needs
`public.clerk_webhook_events` for idempotency and diagnostics.
