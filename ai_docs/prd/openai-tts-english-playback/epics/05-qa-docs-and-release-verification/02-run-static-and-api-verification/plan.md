---
phase: 2
worktree_mode: main
conflict_risk: low
branch: feat/qa-02-static-api-verification
depends_on: [update-tts-qa-and-agent-docs]
blocks: [run-fresh-user-tts-qa]
---

# Execution Strategy - run-static-and-api-verification

Phase 2 runs static and API verification after docs describe the expected TTS flow. This task is mostly evidence collection unless checks expose implementation defects that must be fixed before mobile QA.

Conflict risk is low for planned work, but any discovered fix should stay narrowly scoped and be reflected in the relevant prior task evidence. Run the repo-required checks, including `node --check server/index.mjs`, `npm run typecheck`, `npm run lint`, `npx expo-doctor`, and `/health` when the API is running.
