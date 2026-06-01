# Supabase Migration To Convex PRD

## Purpose

Migrate the Darija to English mobile app from the richer Clerk + Supabase + Trigger.dev architecture to Clerk + Convex while preserving the mobile contract, server-side provider boundary, translation history, and fresh-user QA guarantees.

## Source Context

This package is seeded from read-only analysis of:

- `origin/main`
- `codex/supabase-to-clerk`
- current branch `codex/supabase-migration-to-convex`
- Convex official docs for React Native, Clerk auth, schemas, indexes, file uploads, actions, HTTP actions, and environment variables

## Critical Branch Note

Implementation is now based on the current richer app branch, per the 2026-06-01 urgent migration instruction. Preserve active App Store readiness context and uncommitted work while branching.

Actual starting point:

```bash
git switch -c codex/convex-migration-off-supabase
```

## Primary Decision

Use Convex as the durable app state, storage metadata, translation history, and realtime status layer. Keep Clerk as the identity provider. Keep Trigger.dev as the translation worker at first, because the current worker has a 900 second budget and retries, while Convex actions have tighter runtime and retry constraints.

## Added Research Source

The Convex research package from `/Users/samisabir-idrissi/dev/codex-projects/cash-loan-assignment-project/convex-research` has been copied into `ai_docs/convex-research/` and should be treated as the local Convex research source for this migration.

## Recommended Reading Order

1. `epics/README.md`
2. `epics/00-baseline-recovery-and-contract-freeze/epic-overview.md`
3. `epics/01-convex-foundation-and-clerk-auth/epic-overview.md`
4. `epics/02-convex-data-model-and-access-control/epic-overview.md`
5. `epics/03-convex-storage-and-upload-flow/epic-overview.md`
6. `epics/04-trigger-worker-convex-cutover/epic-overview.md`
7. `epics/05-mobile-realtime-history-and-contracts/epic-overview.md`
8. `epics/06-final-supabase-removal-and-rollout/epic-overview.md`

## Non-Negotiables

- Keep OpenAI and Modal keys server-side.
- Keep Clerk as the app identity source.
- Never trust client-supplied `clerkUserId`; derive it from Clerk or Convex auth.
- Preserve legacy response aliases until the UI and QA prove they are unnecessary.
- Do not migrate large audio through Convex HTTP action JSON bodies.
- Keep `refs/` read-only.
