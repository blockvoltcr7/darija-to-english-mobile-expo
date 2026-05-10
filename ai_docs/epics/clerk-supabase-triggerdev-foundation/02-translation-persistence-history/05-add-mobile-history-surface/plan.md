---
phase: 5
worktree_mode: main
conflict_risk: high
branch: feat/translation-05-mobile-history
depends_on: [add-history-api-endpoints]
blocks: [verify-history-access-controls]
---

# Execution Strategy - add-mobile-history-surface

Phase 5. This task builds the minimal signed-in history experience after the
API contract exists. Expected write targets are `app/history.tsx`,
`app/_layout.tsx`, `lib/api.ts`, `lib/types.ts`, and one entry point in either
`app/index.tsx` or `app/account.tsx`.

Fetch history only through the Express API with a Clerk bearer token. Implement
loading, empty, error, refreshing, list, and detail states while preserving the
current translation tool as the first screen. Reuse existing style patterns and
display English translation before consolidated Darija, with raw provider
transcripts reserved for detail views.

Conflict risk is high because this task touches shared client API/types and
navigation files. Run it after the history API is available so mobile types and
UI behavior can align with the implemented endpoint response.
