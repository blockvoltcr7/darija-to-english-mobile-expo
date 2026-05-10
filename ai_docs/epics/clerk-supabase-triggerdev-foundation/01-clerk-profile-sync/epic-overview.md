# Epic 01: Clerk Profile Sync

## Objective

Guarantee every Clerk-authenticated user has a durable Supabase profile row without relying on Supabase Auth.

## Scope

- Add idempotent profile repository helpers.
- Add lazy profile upsert after Clerk session verification.
- Add Clerk webhook event storage and webhook handling.
- Document and verify webhook/profile-sync behavior.

## Out Of Scope

- Translation result persistence.
- Trigger.dev.
- Usage/billing.

## Tasks

| # | Task | Type | Depends On |
|---|---|---|---|
| 01 | `add-profile-repository-helpers` | Code | `00-clerk-native-db-foundation/add-server-supabase-db-client` |
| 02 | `call-profile-upsert-after-clerk-verification` | Code | `add-profile-repository-helpers` |
| 03 | `create-clerk-webhook-events-migration` | Migration | `00-clerk-native-db-foundation/add-db-local-updated-at-trigger` |
| 04 | `add-clerk-webhook-endpoint` | Code | `add-profile-repository-helpers`, `create-clerk-webhook-events-migration` |
| 05 | `document-clerk-webhook-testing` | Code | `add-clerk-webhook-endpoint` |
| 06 | `verify-profile-sync-end-to-end` | Code | `call-profile-upsert-after-clerk-verification`, `document-clerk-webhook-testing` |

## Verification

- `node --check server/index.mjs`
- `npm run typecheck`
- `npm run lint`
- `curl http://localhost:8787/health`
- Manual profile sync and webhook replay checks.
