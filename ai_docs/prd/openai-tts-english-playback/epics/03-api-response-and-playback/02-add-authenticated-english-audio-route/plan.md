---
phase: 2
worktree_mode: main
conflict_risk: high
branch: feat/playback-02-authenticated-audio-route
depends_on: [add-tts-detail-response-shape]
blocks: [verify-owner-only-artifact-access]
---

# Execution Strategy - add-authenticated-english-audio-route

Phase 2 adds the playback byte route after translation detail can advertise safe TTS metadata. It also depends on the cross-epic storage helper from `01-openai-tts-provider-and-storage/add-translation-artifact-storage-helpers`.

Conflict risk is high because `server/index.mjs`, `server/artifacts.mjs`, and `server/storage.mjs` form the trust boundary. Require Clerk auth, verify artifact ownership server-side, and use 404 for missing, failed, incomplete, or cross-user artifacts.
