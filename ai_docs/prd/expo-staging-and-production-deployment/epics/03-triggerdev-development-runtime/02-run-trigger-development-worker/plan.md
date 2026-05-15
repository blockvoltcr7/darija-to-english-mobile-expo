---
phase: 2
worktree_mode: main
conflict_risk: none
branch: feat/triggerdev-02-run-development-worker
depends_on: [configure-trigger-environments]
blocks: [verify-trigger-claims-real-job]
---

# Execution Strategy - run-trigger-development-worker

Phase 2 runs after Trigger Development environment expectations are configured or precisely blocked. Execute sequentially on the main working branch because a failed or mis-targeted worker connection invalidates the real-job verification task.

The command is `npm run trigger:dev -- --env-file .env.local --skip-update-check`, which runs `trigger.dev dev --config trigger.config.mjs` against the included Development environment. Use `trigger.config.mjs`, `trigger/translate-audio-job.mjs`, `server/translation-pipeline.mjs`, and `package.json` to confirm the connected worker includes task id `translate-audio-job`.

Capture sanitized worker connection evidence in the task-local artifact template. If the CLI is not authenticated, the project is inaccessible, the Development environment is not selected, or bundling fails, record the command and sanitized error in `notes/development-worker-blockers.md` and stop before Phase 3.
