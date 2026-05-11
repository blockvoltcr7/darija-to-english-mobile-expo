---
phase: 2
worktree_mode: main
conflict_risk: medium
branch: feat/storage-02-job-metadata
depends_on: [create-private-storage-buckets]
blocks: [add-server-side-audio-storage-flow, add-triggerdev-project-config, dispatch-triggerdev-from-api]
---

# Execution Strategy - add-storage-metadata-to-jobs

Phase 2 adds the database fields that later server and Trigger.dev work depends on. Keep it sequential after bucket creation so migration constraints and bucket names can match the live storage decision.

Conflict risk is medium. The task will create a new Supabase migration and update `server/translations.mjs`, which is a shared repository boundary used by later tasks. Apply the migration through Supabase MCP for project `npjsersrmvltoxmqdkzd`, then record schema verification in artifacts.
