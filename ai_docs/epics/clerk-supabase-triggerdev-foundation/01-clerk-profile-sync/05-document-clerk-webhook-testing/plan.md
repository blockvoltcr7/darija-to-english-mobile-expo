---
phase: 3
worktree_mode: main
conflict_risk: none
branch: feat/clerk-05-webhook-testing-docs
depends_on: [add-clerk-webhook-endpoint]
blocks: [verify-profile-sync-end-to-end]
---

# Execution Strategy - document-clerk-webhook-testing

Phase 3. Run after the webhook endpoint exists so the guide can describe the
actual route, environment variable names, signature behavior, duplicate-event
behavior, and Supabase verification queries.

Prefer a task-local guide under this task's `resources/` folder unless execution
finds an established broader docs location that should also link to it. Keep all
examples sanitized: no real Clerk tokens, webhook secrets, Supabase keys, or user
PII.

The verification queries in the guide should explicitly use Supabase MCP against
project `npjsersrmvltoxmqdkzd`; do not document a local Supabase workflow.
