# Task 03: Create Clerk-Native Profiles Migration

## Type

Migration

## Context

The durable app identity key must be Clerk's user ID, stored as `profiles.clerk_user_id text unique not null`. This profile table becomes the anchor for jobs, results, usage, entitlements, and account deletion.

This task owns the actual migration that moves `public.profiles` from the old Supabase Auth shape to the Clerk-native shape. It consumes the decision from `retire-supabase-auth-profile-shape` and must not proceed destructively unless the Task 02 inventory confirms that replacing the current table is safe.

The first production path is server-mediated:

- Mobile authenticates with Clerk and calls the app API.
- The API verifies Clerk and uses server-side Supabase/Postgres access.
- App queries filter by `clerk_user_id`.
- Direct mobile-to-Supabase RLS is a later option, not required here.

Any live Supabase CLI or MCP work for this migration must target project ref / MCP `project_id` `npjsersrmvltoxmqdkzd`.

## Implementation

- Ensure Task 01 has established `supabase/migrations/` and the migration README/convention.
- Ensure Task 02 has a completed retirement decision before writing destructive SQL.
- Confirm the CLI is linked to `npjsersrmvltoxmqdkzd` before any live `supabase db push`; MCP migration/SQL calls must use `project_id: npjsersrmvltoxmqdkzd`.
- Create the migration with:
  - `supabase migration new create_clerk_native_profiles`
- If Task 02 confirms `public.profiles` is empty and replaceable, write a migration that:
  - removes old app-owned Supabase Auth artifacts tied to the profile table, including old `profiles` policies and constraints
  - drops or replaces the old `public.profiles` table
  - removes the old `auth.users -> public.handle_new_user()` trigger only if dependency checks prove it is the app-created profile trigger
  - drops `public.handle_new_user()` only if no remaining dependency uses it
- If Task 02 finds real rows, stop and write a data-preserving migration plan before making destructive changes.
- Create `public.profiles` with:
  - `id uuid primary key default gen_random_uuid()`
  - `clerk_user_id text not null unique`
  - `primary_email text`
  - `display_name text`
  - `image_url text`
  - `created_at timestamptz not null default now()`
  - `updated_at timestamptz not null default now()`
  - `deleted_at timestamptz`
- Add a unique index or constraint suitable for profile lookups by `clerk_user_id`.
- Add a normal lookup index only if the uniqueness mechanism does not already create one.
- Enable RLS on `public.profiles` as defense in depth.
- Do not add `auth.uid()` policies.
- Keep the table server-owned for now:
  - do not grant `anon` access
  - do not grant `authenticated` access unless this task is explicitly expanded to direct Supabase client access
  - grant the minimum required access for the server-side Supabase role being used, typically `service_role`
- Add comments to the table/columns if the repo convention permits it, especially for `clerk_user_id`.
- Add verification SQL to prove:
  - `profiles.clerk_user_id` exists, is `text`, is `not null`, and is unique
  - no FK references `auth.users`
  - no policy references `auth.uid()`
  - the old `auth.users` profile trigger is gone or explicitly documented as intentionally retained
- Avoid foreign keys to `auth.users`.

## Acceptance Criteria

- Migration file was created through `supabase migration new`, not by hand-naming a timestamped file.
- Any live dry-run/apply evidence identifies project ref `npjsersrmvltoxmqdkzd`.
- Migration defines a Clerk-native `public.profiles` table.
- `clerk_user_id` is unique and indexed.
- `profiles` has no FK to `auth.users`.
- `profiles` has no `user_id` column unless a non-empty-table migration plan explicitly justifies a temporary compatibility column.
- `profiles` has RLS enabled.
- No `profiles` policy uses `auth.uid()`.
- The migration does not create Clerk webhook tables or profile upsert code.
- The migration does not grant broad `anon` or `authenticated` Data API access.
- The old Supabase Auth profile trigger/function artifacts are removed or explicitly documented with dependency evidence.
- Destructive replacement is gated on Task 02 proving the current table is empty or otherwise safely backed up/mapped.
- Schema aligns with the ERD visual.

## Dependencies

- Depends On: retire-supabase-auth-profile-shape

## Technical Notes

- Use lowercase identifiers.
- Keep the schema minimal; webhook event tracking belongs to Epic 01.
- Prefer `clerk_user_id text` because Clerk user IDs are strings, not UUIDs.
- `gen_random_uuid()` should be verified in the target database before relying on it. If the database requires an extension, add the extension using the repo's Supabase migration convention.
- A `unique` constraint on `clerk_user_id` creates an index in Postgres; do not add a duplicate index unless verification shows it is needed.
- If the server uses Supabase Data API with a service key, explicit `service_role` grants may still be needed as part of the Data API access layer. Do not expose the table to `anon` or `authenticated` for the current server-mediated architecture.
- Task 04 owns the reusable `updated_at` trigger. This task may define the `updated_at` column default, but should not duplicate Task 04's trigger function work.
- Reference: `ai_docs/visuals/clerk-supabase-triggerdev-foundation/02-clerk-native-supabase-erd.png`.

## Artifact Slots

- `artifacts/`: generated migration SQL, local reset output, dry-run output, and schema verification snippets.
- `references/`: ERD, profile-shape decision notes, Supabase Data API/RLS notes.
- `resources/`: SQL commands for checking indexes, constraints, policies, triggers, grants, and generated UUID support.
- `notes/`: migration review notes, rollback notes, and any non-empty-table mapping decision.
