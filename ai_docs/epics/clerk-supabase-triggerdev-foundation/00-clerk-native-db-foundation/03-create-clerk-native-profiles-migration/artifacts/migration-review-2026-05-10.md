# Migration Review - 2026-05-10

## Migration File

- `supabase/migrations/20260510031803_create_clerk_native_profiles.sql`
- Created with `supabase migration new create_clerk_native_profiles`.
- Live target project ref / MCP `project_id`: `npjsersrmvltoxmqdkzd`.

## Destructive-Change Gate

Task 02 live inventory found `public.profiles` row count `0`. The migration still includes a runtime guard that raises an exception if `public.profiles` contains rows when the migration is applied.

## Shape Check

The migration creates `public.profiles` with:

- `id uuid primary key default gen_random_uuid()`
- `clerk_user_id text not null unique`
- `primary_email text`
- `display_name text`
- `image_url text`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `deleted_at timestamptz`

The migration does not create `user_id` and does not add a foreign key to `auth.users`.

## Supabase Auth Artifact Cleanup

The migration removes the old app-created profile signup path:

- `drop trigger if exists on_auth_user_created on auth.users`
- `drop function if exists public.handle_new_user()`

The function drop intentionally omits `cascade`; if another dependency exists, the migration should fail for review instead of deleting unrelated dependencies.

## Access Model

- RLS is enabled on `public.profiles`.
- No `auth.uid()` policies are created.
- `anon` and `authenticated` table privileges are revoked.
- `service_role` receives server-side table privileges.

## Verification

Passed:

- Static grep confirmed `clerk_user_id`, RLS, grant/revoke, and old trigger cleanup are present.
- Static grep confirmed no `auth.uid()` policy is present.
- `git diff --check` passed for the migration and Epic 00 files.

Blocked:

- `supabase migration list --local` failed because local Postgres was not running on `127.0.0.1:54322`.
- No live `db push --dry-run` or live apply was run.

Follow-up:

- Start the local Supabase stack before claiming local migration execution.
- Run `supabase db reset` and the task verification SQL against the local stack.
- For live deployment, link only to `npjsersrmvltoxmqdkzd`, run `supabase db push --dry-run`, review output, then apply only after approval.
