---
phase: 4
worktree_mode: main
conflict_risk: high
branch: feat/tts-04-artifact-storage-helpers
depends_on: [add-tts-provider-router-and-idempotency]
blocks: []
---

# Execution Strategy - add-translation-artifact-storage-helpers

Phase 4 extends server storage after output formats and idempotency metadata are defined. This closes the Epic 01 provider/storage layer and gates pipeline and playback-route work in later epics.

Conflict risk is high because `server/storage.mjs` is shared by original audio upload and now generated artifact storage. Keep the `translation-artifacts` bucket private, avoid object keys that expose text or identity details, and keep playback authorization in API routes rather than Storage policies.
