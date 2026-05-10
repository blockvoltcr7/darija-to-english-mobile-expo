---
phase: 6
worktree_mode: main
conflict_risk: low
branch: feat/translation-06-access-controls
depends_on: [add-history-api-endpoints, add-mobile-history-surface]
blocks: []
---

# Execution Strategy - verify-history-access-controls

Phase 6. This is the final Epic 02 verification gate. It should run after the
history API and mobile surface exist, because it proves both the server
ownership filters and the user-visible history path.

Use API checks for unauthenticated `401` behavior, authenticated own-row access,
and cross-user `404` behavior. Use Supabase MCP read-only inspection against
project `npjsersrmvltoxmqdkzd` to confirm row ownership and cleanup evidence.
If production QA fixtures are needed, use obvious synthetic metadata, avoid real
audio or sensitive transcript content, record row ids, and clean them up in the
same task.

Conflict risk is low because this task should primarily create artifacts and
may only make small corrective fixes if verification exposes a defect. Do not
mark the epic complete until command checks and access-control artifacts are
captured.
