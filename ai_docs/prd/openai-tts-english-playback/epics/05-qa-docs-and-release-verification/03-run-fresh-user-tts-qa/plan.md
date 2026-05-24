---
phase: 3
worktree_mode: main
conflict_risk: medium
branch: feat/qa-03-fresh-user-tts-qa
depends_on: [run-static-and-api-verification]
blocks: [verify-failure-and-cross-user-access-paths]
---

# Execution Strategy - run-fresh-user-tts-qa

Phase 3 runs the fresh Clerk user acceptance path with TTS enabled after static/API checks pass. This is runtime QA, not a substitute for earlier implementation tasks.

Conflict risk is medium because QA can uncover fixes across server pipeline, playback route, and mobile UI. Use an iOS development build, not Expo Go, and keep evidence safe: fixture filename/size, job IDs, Trigger run IDs, redacted identity, and statuses are acceptable; tokens, secrets, full transcripts, private audio, and generated audio bytes are not.
