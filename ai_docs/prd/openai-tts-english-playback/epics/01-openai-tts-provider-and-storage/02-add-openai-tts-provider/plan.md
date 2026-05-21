---
phase: 2
worktree_mode: main
conflict_risk: low
branch: feat/tts-02-openai-provider
depends_on: [add-server-tts-env-contract]
blocks: [add-tts-provider-router-and-idempotency]
---

# Execution Strategy - add-openai-tts-provider

Phase 2 adds the OpenAI TTS provider after the server config contract is available. Keep this provider focused on converting validated English text and server config into an audio `Buffer` plus safe metadata.

Conflict risk is low because the expected write is a new `server/tts/openai-tts.mjs` module. Reuse existing OpenAI client patterns from the server pipeline and keep full English text, provider secrets, and raw provider responses out of thrown errors and logs.
