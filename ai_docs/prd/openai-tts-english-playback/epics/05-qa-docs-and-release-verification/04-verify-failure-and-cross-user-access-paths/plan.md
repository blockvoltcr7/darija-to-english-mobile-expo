---
phase: 4
worktree_mode: main
conflict_risk: high
branch: feat/qa-04-failure-cross-user-access
depends_on: [run-fresh-user-tts-qa]
blocks: []
---

# Execution Strategy - verify-failure-and-cross-user-access-paths

Phase 4 closes the feature by proving TTS failure isolation and owner-only playback access after the happy path succeeds. This should be the final release-readiness gate for the PRD package.

Conflict risk is high because failures here usually point at trust-boundary code in `server/index.mjs`, artifact lookup helpers, or pipeline error handling. Prefer 404 for cross-user artifact access, prove text translation still succeeds when TTS fails, and capture blockers instead of silently widening scope.
