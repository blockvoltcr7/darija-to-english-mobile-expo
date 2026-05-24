---
phase: 4
worktree_mode: main
conflict_risk: high
branch: feat/mobile-04-history-playback-control
depends_on: [add-translate-result-playback-control]
blocks: []
---

# Execution Strategy - add-history-detail-playback-control

Phase 4 reuses the playback control in history detail after the result screen path is working. This task closes the mobile UI gate needed by the QA/docs epic.

Conflict risk is high because `app/history.tsx` is a shared detail/list surface. Reuse the helper and any compact control from the translate screen, preserve existing text/transcript/model diagnostics, and leave history list rows unchanged unless metadata is already available cheaply.
