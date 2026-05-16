# Epic 00: Baseline Recovery And Contract Freeze

## Objective

Start the migration from the branch that contains the real Clerk/Supabase/Trigger implementation and freeze the runtime contracts before adding Convex.

## Scope

- Verify the implementation base branch.
- Inventory Supabase, Trigger.dev, Clerk, storage, and mobile API surfaces.
- Freeze request, response, status, history, and health contracts.

## Out Of Scope

- Installing Convex.
- Editing runtime code.
- Removing Supabase.

## Tasks

| # | Task | Type | Depends On |
| --- | --- | --- | --- |
| 01 | `verify-implementation-base` | Planning | none |
| 02 | `inventory-supabase-surfaces` | Planning | `verify-implementation-base` |
| 03 | `freeze-runtime-contracts` | Planning | `inventory-supabase-surfaces` |

## Verification

- The implementation base is confirmed as `origin/main` or a documented newer branch.
- Current branch drift is explicitly recorded.
- Contract files and endpoints are listed before any Convex work starts.

