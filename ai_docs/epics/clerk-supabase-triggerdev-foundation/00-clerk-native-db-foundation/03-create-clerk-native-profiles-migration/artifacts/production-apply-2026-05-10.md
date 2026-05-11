# Production Apply - 2026-05-10

## Scope

- Supabase MCP migration: `create_clerk_native_profiles`
- Target project ref / MCP `project_id`: `npjsersrmvltoxmqdkzd`
- Apply method: Supabase MCP `apply_migration`
- Local Supabase stack: not used

## Preflight

Supabase MCP `list_tables` confirmed the live `public.profiles` table was still empty and still Supabase Auth-shaped immediately before apply:

- `public.profiles` rows: `0`
- primary key: `user_id`
- foreign key: `public.profiles.user_id -> auth.users.id`

Supabase MCP security advisors were checked before apply. Existing warnings were unrelated to this task:

- `public.rls_auto_enable()` executable by `anon`
- `public.rls_auto_enable()` executable by `authenticated`

Those warnings were not changed in Epic 00 because they are outside the Clerk-native profile migration scope.

## Result

Supabase MCP `apply_migration` returned success for `create_clerk_native_profiles`.

Production verification after apply confirmed:

- `public.profiles` row count: `0`
- `id uuid primary key default gen_random_uuid()`
- `clerk_user_id text not null unique`
- `primary_email text`
- `display_name text`
- `image_url text`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `deleted_at timestamptz`
- RLS enabled
- profile policy count: `0`
- `auth.uid()` profile policy count: `0`
- FK count from `profiles` to `auth.users`: `0`
- `auth.users -> public.handle_new_user()` trigger count: `0`
- `public.handle_new_user()` function count: `0`

No Supabase CLI local apply, local reset, or live CLI push was used.
