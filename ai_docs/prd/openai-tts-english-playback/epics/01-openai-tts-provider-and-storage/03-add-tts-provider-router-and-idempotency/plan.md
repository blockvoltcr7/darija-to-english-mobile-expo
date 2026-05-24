---
phase: 3
worktree_mode: main
conflict_risk: medium
branch: feat/tts-03-router-idempotency
depends_on: [add-openai-tts-provider]
blocks: [add-translation-artifact-storage-helpers]
---

# Execution Strategy - add-tts-provider-router-and-idempotency

Phase 3 adds the provider router and deterministic hash after the OpenAI provider exists. This task defines the billing-control boundary that later pipeline code uses before any paid TTS call.

Conflict risk is medium. The expected module is `server/tts/index.mjs`, but the hash shape becomes a cross-feature contract for artifact lookup and retry behavior. Use deterministic serialization of English text, provider, model, voice, and format.
