# Epic 03: Storage And Trigger.dev Workflow

## Objective

Move audio from synchronous base64 processing toward private Supabase bucket storage and Trigger.dev async processing.

## Scope

- Add private bucket definitions.
- Add storage metadata to jobs.
- Store original audio server-side.
- Add Trigger.dev task config, dispatch, and processing.
- Add mobile job polling.

## Out Of Scope

- RevenueCat.
- Full usage ledger.
- Store submission.

## Tasks

| # | Task | Type | Depends On |
|---|---|---|---|
| 01 | `create-private-storage-buckets` | Infrastructure | `02-translation-persistence-history/verify-history-access-controls` |
| 02 | `add-storage-metadata-to-jobs` | Migration | `create-private-storage-buckets` |
| 03 | `add-server-side-audio-storage-flow` | Code | `add-storage-metadata-to-jobs` |
| 04 | `add-triggerdev-project-config` | Infrastructure | `add-server-side-audio-storage-flow` |
| 05 | `add-triggerdev-translation-task` | Code | `add-triggerdev-project-config` |
| 06 | `dispatch-triggerdev-from-api` | Code | `add-triggerdev-translation-task` |
| 07 | `add-mobile-job-polling` | UI | `dispatch-triggerdev-from-api` |
| 08 | `verify-async-job-flow` | Code | `add-mobile-job-polling` |

## Verification

- `node --check server/index.mjs`
- `npm run typecheck`
- `npm run lint`
- `npx expo-doctor`
- Manual job transition and result visibility checks.
