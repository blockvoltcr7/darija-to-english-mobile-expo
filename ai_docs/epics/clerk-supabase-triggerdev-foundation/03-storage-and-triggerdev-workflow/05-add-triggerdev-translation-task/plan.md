---
phase: 5
worktree_mode: main
conflict_risk: high
branch: feat/storage-05-triggerdev-task
depends_on: [add-triggerdev-project-config]
blocks: [dispatch-triggerdev-from-api, add-mobile-job-polling, verify-async-job-flow]
---

# Execution Strategy - add-triggerdev-translation-task

Phase 5 creates the async worker task once Trigger.dev config exists. Run sequentially because this task extracts or shares the provider pipeline from `server/index.mjs` and will define the task contract used by API dispatch.

Conflict risk is high. Expected files include `trigger/`, `server/translation-pipeline.mjs`, `server/translations.mjs`, `server/storage.mjs`, and possibly `server/index.mjs` if provider logic is extracted. Use task ID `translate-audio-job`, payload `{ job_id }`, and Trigger.dev idempotency around `translation-job:<job_id>`.
