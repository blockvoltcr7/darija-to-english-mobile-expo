# Epic 04: Usage Controls And Release Readiness

## Objective

Protect provider spend and prepare the backend foundation for beta users.

## Scope

- Add usage ledger foundation.
- Add reservations, limits, and kill switch.
- Add retention/account deletion data flows.
- Add legal and beta readiness docs.

## Out Of Scope

- Full RevenueCat implementation.
- App Store and Google Play submission.
- Advanced analytics dashboard.

## Tasks

| # | Task | Type | Depends On |
|---|---|---|---|
| 01 | `create-usage-ledger-schema` | Migration | `03-storage-and-triggerdev-workflow/verify-async-job-flow` |
| 02 | `add-usage-reservation-before-provider-calls` | Code | `create-usage-ledger-schema` |
| 03 | `add-basic-rate-limits-and-kill-switch` | Code | `add-usage-reservation-before-provider-calls` |
| 04 | `add-storage-retention-cleanup` | Code | `03-storage-and-triggerdev-workflow/verify-async-job-flow` |
| 05 | `add-account-deletion-data-flow` | Code | `add-storage-retention-cleanup` |
| 06 | `add-legal-and-beta-docs` | Code | `add-account-deletion-data-flow` |
| 07 | `verify-cost-control-paths` | Code | `add-basic-rate-limits-and-kill-switch`, `add-legal-and-beta-docs` |

## Verification

- `node --check server/index.mjs`
- `npm run typecheck`
- `npm run lint`
- `npx expo-doctor`
- Manual over-limit and retention cleanup checks.
