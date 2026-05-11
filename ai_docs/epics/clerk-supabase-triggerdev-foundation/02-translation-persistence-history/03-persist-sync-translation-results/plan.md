---
phase: 3
worktree_mode: main
conflict_risk: high
branch: feat/translation-03-sync-persistence
depends_on: [create-translation-db-writers]
blocks: [add-history-api-endpoints, add-mobile-history-surface]
---

# Execution Strategy - persist-sync-translation-results

Phase 3. This task integrates translation persistence into the current
synchronous route. The main write scope is `server/index.mjs`, with only
additive contract updates in `lib/types.ts` if the response gains a job id.

Implement the DB write flow after Clerk auth, profile resolution, and payload
validation, and before paid provider calls. Preserve the existing provider
semantics: OpenAI STT and Modal Darija ASR both remain required before
consolidation, and the mobile response shape remains compatible. Any new
response field must be additive.

Conflict risk is high because `server/index.mjs` is the central API route file
and this task changes error handling around provider calls. Complete this
before adding history read endpoints so the history API can rely on real
persisted rows.
