---
phase: 3
worktree_mode: main
conflict_risk: high
branch: feat/artifact-03-provider-run-contract
depends_on: [add-artifact-repository-helpers]
blocks: []
---

# Execution Strategy - extend-provider-run-operation-contract

Phase 3 decides whether TTS participates in the existing provider-run diagnostics contract or stays fully represented by `translation_artifacts`. Run this after repository helpers exist so the decision can be grounded in the artifact lifecycle rather than guessed.

Conflict risk is high because this can touch shared server diagnostics and database constraint surfaces such as `server/translations.mjs`, `server/translation-pipeline.mjs`, provider-operation constants, and possibly SQL constraints. A no-op code decision is valid if documented in task notes, but the decision must be explicit before pipeline TTS integration begins.
