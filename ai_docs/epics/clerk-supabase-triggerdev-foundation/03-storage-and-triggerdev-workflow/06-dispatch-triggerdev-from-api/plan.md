---
phase: 6
worktree_mode: main
conflict_risk: high
branch: feat/storage-06-triggerdev-dispatch
depends_on: [add-triggerdev-translation-task]
blocks: [add-mobile-job-polling, verify-async-job-flow]
---

# Execution Strategy - dispatch-triggerdev-from-api

Phase 6 adds the async `POST /v1/translations` route after the worker task exists. Keep it sequential because it integrates all prior pieces: Clerk auth/profile, Supabase job rows, Storage upload, and Trigger.dev dispatch.

Conflict risk is high. Expected shared files include `server/index.mjs`, `server/translations.mjs`, `server/storage.mjs`, `server/env.mjs`, `.env.example`, and `lib/types.ts`. Preserve the existing sync route unless the task artifact records an explicit compatibility decision.
