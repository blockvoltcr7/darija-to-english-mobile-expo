# Task 04: Add DB-Local updated_at Trigger

## Type

Database Function

## Context

Postgres triggers should only handle database-owned side effects. Clerk signup events happen outside Postgres and must not be modeled as `auth.users` triggers. The Clerk-native `public.profiles` table from `create-clerk-native-profiles-migration` has an `updated_at` column that should be maintained by the database whenever a row changes.

This task owns the reusable `updated_at` trigger function and the first trigger attachment on `public.profiles`. Future mutable tables such as `translation_jobs` can reuse the same function in later epics.

Any live Supabase CLI or MCP work for this trigger must target project ref / MCP `project_id` `npjsersrmvltoxmqdkzd`.

## Implementation

- Create the migration with `supabase migration new add_db_local_updated_at_trigger`.
- Confirm the CLI is linked to `npjsersrmvltoxmqdkzd` before any live `supabase db push`; MCP migration/SQL calls must use `project_id: npjsersrmvltoxmqdkzd`.
- Add or reuse a `public.set_updated_at()` trigger function in SQL.
- Keep the function narrow: assign `new.updated_at = now()` and return `new`.
- Attach the trigger to `public.profiles` with a clear name such as `profiles_set_updated_at`.
- Make the trigger `before update` and row-level.
- Make the migration idempotent where practical:
  - replace the function definition safely
  - drop an existing same-named trigger before creating it
- Add verification SQL that:
  - inserts or selects a test profile in a safe local/dev database
  - updates a non-identity field
  - confirms `updated_at` increases
  - confirms no `auth.users` trigger was added by this task
- Do not create, replace, or depend on the old `public.handle_new_user()` function.

## Acceptance Criteria

- [ ] Migration file was created through `supabase migration new`.
- [ ] Any live dry-run/apply evidence identifies project ref `npjsersrmvltoxmqdkzd`.
- [ ] `public.set_updated_at()` exists and only mutates `new.updated_at`.
- [ ] `public.profiles` has a `before update` row trigger using `public.set_updated_at()`.
- [ ] Updating a profile row changes `updated_at`.
- [ ] The trigger does not call external services or reference Clerk.
- [ ] No trigger is added on `auth.users`.
- [ ] No old Supabase Auth profile trigger is recreated.

## Dependencies

- Depends On: create-clerk-native-profiles-migration
- Blocks: add-foundation-verification-docs

## Technical Notes

- Later mutable tables can reuse this trigger; avoid table-specific naming inside the function body.
- Clerk lifecycle sync belongs to Epic 01 webhooks and lazy upsert.
- Use `now()`/`transaction_timestamp()` consistently with the rest of the migration style; do not use app-server timestamps for this column.
- Task 03 defines the `updated_at` column and default; this task owns automatic update behavior.
- The verification query should run only against local/dev or a deliberately approved live environment.

## Artifact Slots

- `artifacts/`: generated migration SQL and update verification output.
- `references/`: trigger-boundary notes from the solidification plan.
- `resources/`: SQL trigger outline and update/check commands.
- `notes/`: database-local trigger decisions and any timestamp behavior decision.
