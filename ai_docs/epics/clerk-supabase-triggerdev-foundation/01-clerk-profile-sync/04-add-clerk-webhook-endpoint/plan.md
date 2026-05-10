---
phase: 2
worktree_mode: sequential
conflict_risk: high
branch: feat/clerk-04-webhook-endpoint
depends_on: [add-profile-repository-helpers, create-clerk-webhook-events-migration]
blocks: [document-clerk-webhook-testing]
---

# Execution Strategy - add-clerk-webhook-endpoint

Phase 2. This is ready after the profile helpers and webhook-events migration,
but it should not be developed in parallel with
`call-profile-upsert-after-clerk-verification` on the same branch because both
touch `server/index.mjs`.

The critical implementation risk is raw-body handling. Register or otherwise
preserve the exact webhook payload before the global JSON parser mutates it,
then verify Clerk signatures before reading trusted event data or writing to
Supabase.

Expected write scope includes `server/index.mjs`, `server/env.mjs`,
`.env.example`, `package.json`, and `package-lock.json` if a webhook verification
dependency is added. Any DB verification must use Supabase MCP with project
`npjsersrmvltoxmqdkzd`.
