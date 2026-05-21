---
phase: 1
worktree_mode: main
conflict_risk: high
branch: feat/tts-01-server-env-contract
depends_on: []
blocks: [add-openai-tts-provider]
---

# Execution Strategy - add-server-tts-env-contract

Phase 1 adds the server-only TTS environment contract after Epic 00 creates the artifact schema. The cross-epic gate is `00-artifact-schema-and-repository/create-translation-artifacts-migration`; do not start provider work until that migration contract is stable.

Conflict risk is high because env parsing is a shared server startup surface. Update `server/env.mjs` conservatively, keep `ENABLE_TTS=false` as the default, reuse `OPENAI_API_KEY`, and avoid adding any mobile-visible OpenAI or storage secrets.
