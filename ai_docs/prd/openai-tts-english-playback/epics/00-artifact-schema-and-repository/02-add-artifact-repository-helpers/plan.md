---
phase: 2
worktree_mode: main
conflict_risk: medium
branch: feat/artifact-02-repository-helpers
depends_on: [create-translation-artifacts-migration]
blocks: [extend-provider-run-operation-contract]
---

# Execution Strategy - add-artifact-repository-helpers

Phase 2 adds the server-side repository helpers after the artifact schema exists. Execute sequentially because later provider, pipeline, and response mapping tasks will build directly on the helper names and lifecycle semantics chosen here.

Conflict risk is medium. The likely new file is `server/artifacts.mjs`, but this task may also need light integration with `server/translations.mjs` conventions. Keep helper names explicit around running, succeeded, failed, and owner-owned lookup states so downstream code reads as a small state machine.
