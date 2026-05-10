---
phase: 2
worktree_mode: main
conflict_risk: low
branch: feat/translation-02-db-writers
depends_on: [create-translation-schema]
blocks: [persist-sync-translation-results, add-history-api-endpoints]
---

# Execution Strategy - create-translation-db-writers

Phase 2. This task follows the schema migration and creates the server-only
persistence boundary that later route work will use. The primary write target is
`server/translations.mjs`, using `server/profiles.mjs` as the local repository
pattern and `server/db.mjs` as the Supabase admin-client boundary.

Keep this task free of route behavior. It should define focused helpers for
job creation, provider-run recording, result writing, and status transitions,
but should not modify `/v1/translate-audio`, add history endpoints, update
mobile types, upload files, or dispatch async jobs.

Conflict risk is low because the task should mostly add a new module. It blocks
sync-route persistence and history read endpoints, both of which need this
module as their single translation persistence interface.
