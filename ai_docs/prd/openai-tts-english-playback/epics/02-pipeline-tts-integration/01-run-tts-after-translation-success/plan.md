---
phase: 1
worktree_mode: main
conflict_risk: high
branch: feat/pipeline-01-run-tts-after-translation
depends_on: []
blocks: [skip-existing-successful-tts-artifacts]
---

# Execution Strategy - run-tts-after-translation-success

Phase 1 integrates TTS into the existing translation pipeline after cross-epic prerequisites are complete: `01-openai-tts-provider-and-storage/add-translation-artifact-storage-helpers` and `00-artifact-schema-and-repository/extend-provider-run-operation-contract`.

Conflict risk is high because this touches `server/translation-pipeline.mjs`, `server/artifacts.mjs`, `server/storage.mjs`, and possibly translation repository behavior. Preserve the text-first sequence: write the English translation result first, then treat TTS as an optional artifact enhancement.
