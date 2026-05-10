---
phase: 4
worktree_mode: main
conflict_risk: none
branch: feat/clerk-06-profile-sync-verification
depends_on: [call-profile-upsert-after-clerk-verification, document-clerk-webhook-testing]
blocks: []
---

# Execution Strategy - verify-profile-sync-end-to-end

Phase 4. This is the Epic 01 QA gate and should run only after lazy
authenticated-request upsert and webhook testing documentation are complete.

Run static checks, start the API, verify `/health` and `/health/supabase`, then
exercise both sync paths: authenticated API upsert and signed Clerk webhook
delivery. Supabase checks must use MCP against project `npjsersrmvltoxmqdkzd`.

Record sanitized evidence in the task's `artifacts/` folder. Do not mark the
epic ready if only one sync path has been tested. This task has an external
handoff to `02-translation-persistence-history/create-translation-schema`, but
that cross-epic dependency is intentionally not listed in frontmatter `blocks`
because `run-epic` expects same-epic slugs there.
