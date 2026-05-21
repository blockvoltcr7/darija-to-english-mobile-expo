---
phase: 1
worktree_mode: main
conflict_risk: medium
branch: feat/qa-01-tts-qa-agent-docs
depends_on: []
blocks: [run-static-and-api-verification]
---

# Execution Strategy - update-tts-qa-and-agent-docs

Phase 1 updates QA and agent docs after `04-mobile-playback-ui/add-history-detail-playback-control` is complete. Do this before running final checks so the verification path and evidence rules match the implemented feature.

Conflict risk is medium because this can touch shared operating docs such as `ai_docs/fresh-clerk-user-qa.md`, `server/AGENTS.md`, and possibly root `AGENTS.md`. Keep evidence guidance privacy-aware: no tokens, secrets, full transcripts, private audio contents, or generated audio bytes.
