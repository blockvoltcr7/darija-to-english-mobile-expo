---
phase: 3
worktree_mode: main
conflict_risk: high
branch: feat/pipeline-03-isolate-tts-failure
depends_on: [skip-existing-successful-tts-artifacts]
blocks: []
---

# Execution Strategy - record-tts-failure-without-failing-text-result

Phase 3 isolates provider/storage failures after idempotent TTS execution exists. This is the reliability boundary that lets the text translation remain succeeded even when speech generation fails.

Conflict risk is high because error handling sits directly in `server/translation-pipeline.mjs` and artifact status helpers. Persist only safe error codes/messages for public surfaces and keep richer debugging out of user-facing fields unless explicitly sanitized.
