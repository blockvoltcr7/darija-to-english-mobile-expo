# Task 02: Retire Supabase Auth Profile Shape

## Type

Migration

## Context

The live `public.profiles` table is shaped for Supabase Auth: `user_id uuid` primary key referencing `auth.users.id`, with policies based on `auth.uid()` and an `auth.users` insert trigger that calls `public.handle_new_user()`. The app is staying with Clerk, so app-owned identity state must move away from `auth.users`.

This task decides and documents the retirement path for the old profile shape. It should not create the final Clerk-native table; that belongs to `create-clerk-native-profiles-migration`. The purpose here is to remove ambiguity before schema SQL is written.

Current app flow already uses Clerk at the API boundary:

- Mobile obtains a Clerk token in `app/index.tsx`.
- `lib/api.ts` sends `Authorization: Bearer <Clerk session token>` to `/v1/translate-audio`.
- `server/index.mjs` verifies Clerk in `requireClerkSession` before provider calls.

The DB transition should preserve that boundary: the mobile app still talks to the app API, and the server uses Supabase/Postgres server-side credentials. Direct mobile-to-Supabase RLS is out of scope for this epic.

All live Supabase inspection for this task must target project ref / MCP `project_id` `npjsersrmvltoxmqdkzd` (`Darija To English EXPO`).

## Implementation

- Read the migration convention from `01-establish-migration-convention` before drafting the retirement plan.
- Use Supabase MCP with `project_id: npjsersrmvltoxmqdkzd` or a CLI link to `npjsersrmvltoxmqdkzd` for any live read-only inspection.
- Inventory the current live `profiles` shape before deciding the replacement approach:
  - row count
  - columns and defaults
  - primary key, unique constraints, foreign keys, and indexes
  - RLS enabled status
  - policies, especially `auth.uid()` usage
  - grants for `anon`, `authenticated`, and `service_role`
  - triggers on `public.profiles`
  - `auth.users` trigger(s) that call `public.handle_new_user()`
  - definition and grants for `public.handle_new_user()`
- Document the recommended retirement strategy:
  - If `public.profiles` is still empty, replace it in the Task 03 migration instead of preserving `user_id`.
  - If rows exist, stop and produce a backup/mapping plan before any destructive change.
  - Prefer a clean Clerk-native `public.profiles` shape over a transitional table that keeps `user_id`.
- Decide how the old Supabase Auth artifacts will be handled in the Task 03 migration:
  - Remove the FK from `profiles` to `auth.users` by replacing the table or dropping the old constraint.
  - Remove `auth.uid()` policies from the app-owned profile table.
  - Remove or disable the `auth.users -> public.handle_new_user()` trigger if it was app-created for the old profile flow.
  - Drop `public.handle_new_user()` only if no remaining trigger/function dependency uses it.
- Explicitly keep Supabase Auth system tables untouched unless a specific app-created artifact must be removed.
- Document that Clerk webhook and lazy profile upsert behavior remain in Epic 01, not this task.
- Add task-local references/resources for the inspection queries and decision record.

## Acceptance Criteria

- Current live `profiles` inventory is documented or the task records why live inspection was unavailable.
- Live inspection evidence identifies project ref `npjsersrmvltoxmqdkzd`.
- The retirement decision states whether the old table will be dropped, renamed, or replaced.
- If the table is empty, the recommended path is explicit: replace the old Supabase Auth-shaped `profiles` table with the Clerk-native table in Task 03.
- If the table is not empty, the task requires a backup/export and row-mapping plan before destructive changes.
- The final direction removes dependence on `auth.users` for app-owned profile state.
- The final direction removes `auth.uid()` profile policies from the app-owned profile table.
- The plan identifies the old `auth.users` trigger and `public.handle_new_user()` function as artifacts to inspect and remove only when dependency checks prove they are app-owned and unused.
- The plan confirms app ownership will use `clerk_user_id text`, while Supabase Auth may continue to exist as a Supabase system feature.
- The task does not add webhook behavior, API profile upsert behavior, or direct mobile-to-Supabase RLS.

## Dependencies

- Depends On: establish-migration-convention

## Technical Notes

- Use the ERD visual as a reference: `ai_docs/visuals/clerk-supabase-triggerdev-foundation/02-clerk-native-supabase-erd.png`.
- Current source references:
  - `app/index.tsx`: Clerk token retrieval before API call.
  - `lib/api.ts`: authenticated `/v1/translate-audio` request.
  - `server/index.mjs`: `requireClerkSession` sets `req.clerkAuth.userId`.
- Do not use `auth.uid()` for Clerk-owned table policies in the current server-mediated architecture.
- Supabase third-party auth for Clerk can support Clerk-aware RLS later, but it is not required for the first server-owned persistence path.
- Do not drop Supabase system schemas or tables. Only remove app-created artifacts that bind `public.profiles` to Supabase Auth.
- Do not add Clerk webhook behavior in this task.

## Artifact Slots

- `artifacts/`: live schema inventory output, backup/export confirmation, or draft retirement SQL if captured later.
- `references/`: current live DB shape notes, ERD reference, Clerk/Supabase auth boundary references.
- `resources/`: SQL inspection commands for profiles, policies, triggers, functions, grants, and dependency checks.
- `notes/`: retirement decision record, rollback assumptions, and risk notes about replacing the empty table.
