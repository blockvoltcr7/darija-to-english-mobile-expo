---
phase: 2
worktree_mode: main
conflict_risk: medium
branch: feat/mobile-02-authenticated-playback-helper
depends_on: [add-client-tts-types-and-api-mapping]
blocks: [add-translate-result-playback-control]
---

# Execution Strategy - add-authenticated-audio-playback-helper

Phase 2 adds reusable authenticated playback after mobile types can carry `tts` metadata and after `03-api-response-and-playback/verify-owner-only-artifact-access` proves the server route boundary.

Conflict risk is medium. The helper or hook may be mostly new code, but it must integrate with Clerk token refresh and installed Expo audio/filesystem capabilities. Prefer the smallest reusable helper that works for both translate results and history detail, and never autoplay.
