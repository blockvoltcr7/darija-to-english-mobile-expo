---
phase: 1
worktree_mode: parallel
conflict_risk: low
branch: feat/clerk-01-profile-repository-helpers
depends_on: []
blocks: [call-profile-upsert-after-clerk-verification, add-clerk-webhook-endpoint]
---

# Execution Strategy - add-profile-repository-helpers

Phase 1. This can run in parallel with `create-clerk-webhook-events-migration`
because it should create a focused server-only repository module, likely
`server/profiles.mjs`, while the migration task creates database schema.

Keep the write scope narrow: add the profile helper module and only touch shared
server files if a direct import/export contract forces it. The helpers should
use `server/db.mjs` as the Supabase admin-client boundary and should not
introduce route behavior, webhook signature verification, or translation
persistence.

External prerequisite `00-clerk-native-db-foundation/add-server-supabase-db-client`
is already complete. This task blocks both lazy authenticated-request profile
sync and signed Clerk webhook handling.
