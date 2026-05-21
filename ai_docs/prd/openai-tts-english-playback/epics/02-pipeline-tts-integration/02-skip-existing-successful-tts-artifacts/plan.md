---
phase: 2
worktree_mode: main
conflict_risk: high
branch: feat/pipeline-02-skip-existing-tts
depends_on: [run-tts-after-translation-success]
blocks: [record-tts-failure-without-failing-text-result]
---

# Execution Strategy - skip-existing-successful-tts-artifacts

Phase 2 adds the cost-control path after the first TTS pipeline call exists. Run sequentially so the idempotency check is placed at the correct point before provider invocation.

Conflict risk is high because this modifies the same pipeline and artifact lifecycle files as Phase 1. The expected behavior is strict: reuse a matching successful artifact, do not reuse failed audio, and avoid duplicate paid calls during normal retries.
