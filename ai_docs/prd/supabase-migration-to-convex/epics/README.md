# Supabase Migration To Convex Epics

## Objective

Replace Supabase Postgres and Supabase Storage with Convex database, functions, storage, and realtime queries while preserving the existing Clerk auth model, Trigger.dev processing path, API compatibility, and mobile QA surface.

## Epics

| # | Epic | Purpose |
| --- | --- | --- |
| 00 | `baseline-recovery-and-contract-freeze` | Start from the correct branch and freeze the existing Clerk/Supabase/Trigger contracts before changing infrastructure. |
| 01 | `convex-foundation-and-clerk-auth` | Add Convex, generated API, Clerk JWT validation, provider wiring, and health visibility. |
| 02 | `convex-data-model-and-access-control` | Port Supabase tables and RLS assumptions into Convex schema, indexes, functions, and explicit auth checks. |
| 03 | `convex-storage-and-upload-flow` | Replace Supabase Storage and base64 upload paths with Convex storage IDs and upload URLs. |
| 04 | `trigger-worker-convex-cutover` | Keep Trigger.dev but move job claiming, provider auditing, and result writes to Convex. |
| 05 | `mobile-realtime-history-and-contracts` | Move mobile status/history from REST polling to Convex realtime while preserving result aliases. |
| 06 | `final-supabase-removal-and-rollout` | Decide backfill/retention, remove Supabase dependencies, update docs, and complete release QA. |

## Dependency Graph

```text
00-baseline-recovery-and-contract-freeze
  -> 01-convex-foundation-and-clerk-auth
    -> 02-convex-data-model-and-access-control
      -> 03-convex-storage-and-upload-flow
        -> 04-trigger-worker-convex-cutover
          -> 05-mobile-realtime-history-and-contracts
            -> 06-final-supabase-removal-and-rollout
```

## Shared Verification Commands

Run these after code-changing tasks unless the task says otherwise:

```bash
node --check server/index.mjs
npm run typecheck
npm run lint
npx expo-doctor
curl http://localhost:8787/health
```

Convex-specific tasks also require:

```bash
npx convex dev
```

Trigger-specific tasks also require:

```bash
npm run trigger:dev
```

## Rollback Principle

Keep the Supabase-backed path available until Convex handles a fresh Clerk-user translation from upload through history detail. Supabase removal only happens in Epic 06.

