---
phase: 1
worktree_mode: main
conflict_risk: high
branch: feat/mobile-01-client-tts-types
depends_on: []
blocks: [add-authenticated-audio-playback-helper]
---

# Execution Strategy - add-client-tts-types-and-api-mapping

Phase 1 updates mobile API contracts after `03-api-response-and-playback/add-tts-detail-response-shape` is available. Start with types and mapping before adding playback behavior or UI.

Conflict risk is high because `lib/types.ts` and `lib/api.ts` are shared by upload, polling, history, and result screens. Keep `tts: null` a normal state and do not leak OpenAI, Supabase Storage, or object-key implementation details into mobile types.
