---
phase: 3
worktree_mode: main
conflict_risk: high
branch: feat/mobile-03-translate-playback-control
depends_on: [add-authenticated-audio-playback-helper]
blocks: [add-history-detail-playback-control]
---

# Execution Strategy - add-translate-result-playback-control

Phase 3 adds the first visible playback UI after the authenticated helper exists. Keep the control compact and scoped to succeeded TTS under the English translation result.

Conflict risk is high because `app/translate.tsx` is a primary workflow screen. Do not add autoplay, do not hide the text translation behind audio state, and keep failed or missing TTS from dominating the success path.
