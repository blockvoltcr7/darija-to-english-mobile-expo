---
phase: 7
worktree_mode: main
conflict_risk: high
branch: feat/storage-07-mobile-polling
depends_on: [dispatch-triggerdev-from-api]
blocks: [verify-async-job-flow]
---

# Execution Strategy - add-mobile-job-polling

Phase 7 switches the mobile submission flow to the async API after the backend route is available. Execute sequentially because it modifies the main screen and API/type contracts that depend on the finalized backend response shape.

Conflict risk is high. Expected shared files include `lib/api.ts`, `lib/types.ts`, `app/index.tsx`, and possibly `app/history.tsx`. Keep the mobile app limited to Clerk tokens and API polling; do not add Supabase Storage or Trigger.dev clients to mobile.
