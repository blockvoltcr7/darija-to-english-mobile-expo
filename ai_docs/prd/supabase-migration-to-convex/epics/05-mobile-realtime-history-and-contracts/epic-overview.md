# Epic 05: Mobile Realtime History And Contracts

## Objective

Move the mobile app from REST polling to Convex realtime queries while preserving result fields, history behavior, and user isolation.

## Scope

- Replace polling with `useQuery` state.
- Port history list/detail to Convex.
- Preserve legacy aliases.
- Verify fresh Clerk-user isolation.

## Out Of Scope

- Removing the Express API facade.
- Removing Trigger.dev.
- Removing Supabase dependencies.

## Tasks

| # | Task | Type | Depends On |
| --- | --- | --- | --- |
| 01 | `replace-polling-with-realtime-query` | Code | Epic 04 |
| 02 | `port-history-to-convex` | Code | `replace-polling-with-realtime-query` |
| 03 | `preserve-legacy-result-aliases` | Code | `port-history-to-convex` |
| 04 | `verify-user-isolation` | QA | `preserve-legacy-result-aliases` |

## Verification

- Upload status updates without manual polling.
- History shows only the signed-in user's jobs.
- UI still renders all expected result sections.

