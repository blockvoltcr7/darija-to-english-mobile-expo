---
phase: 4
worktree_mode: main
conflict_risk: high
branch: feat/translation-04-history-api
depends_on: [persist-sync-translation-results]
blocks: [add-mobile-history-surface, verify-history-access-controls]
---

# Execution Strategy - add-history-api-endpoints

Phase 4. This task adds the server-mediated read API after synchronous
translation writes exist. The expected write scope is `server/index.mjs` for
route registration and `server/translations.mjs` for read helpers.

Protect `GET /v1/translations` and `GET /v1/translations/:id` with Clerk auth
and filter every query by `req.clerkAuth.userId`. Cross-user or missing detail
ids should return `404` without revealing ownership. Keep provider payloads,
headers, stack traces, bearer tokens, audio base64, and other unsafe internals
out of responses.

Conflict risk is high because this task touches the same shared server files as
the previous phase. It should run after sync persistence is integrated and
before the mobile history screen is built against the endpoint contract.
