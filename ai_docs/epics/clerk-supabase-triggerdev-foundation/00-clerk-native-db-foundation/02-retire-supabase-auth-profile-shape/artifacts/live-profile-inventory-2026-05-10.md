# Live Profile Inventory - 2026-05-10

## Scope

- Supabase project ref / MCP `project_id`: `npjsersrmvltoxmqdkzd`
- Project name: `Darija To English EXPO`
- Inspection mode: read-only SQL through Supabase MCP
- Inspection timestamp: `2026-05-10T03:13:13Z`

The project-scoped Codex Apps Supabase MCP call with `project_id: npjsersrmvltoxmqdkzd` returned a permission error. The fallback configured Supabase MCP connection was then used for read-only SQL, and the query output included `intended_project_id = npjsersrmvltoxmqdkzd`.

## Row Counts And Migration History

- `public.profiles` row count: `0`
- `auth.users` row count: `0`
- `to_regclass('supabase_migrations.schema_migrations')`: `null`

## Current `public.profiles` Shape

| Column | Type | Nullable | Default |
|---|---|---|---|
| `user_id` | `uuid` | no | none |
| `username` | `text` | no | none |
| `created_at` | `timestamptz` | no | `now()` |
| `updated_at` | `timestamptz` | no | `now()` |

## Constraints And Indexes

- Primary key: `profiles_pkey` on `user_id`
- Foreign key: `profiles_user_id_fkey` from `profiles.user_id` to `auth.users.id`
- Unique constraint: `profiles_username_key` on `username`
- Indexes:
  - `profiles_pkey` unique btree on `user_id`
  - `profiles_username_key` unique btree on `username`

## RLS, Policies, And Grants

- RLS enabled: `true`
- RLS forced: `false`
- Policies:
  - `profiles_select_own`: `SELECT` for `authenticated`, uses `auth.uid() = user_id`
  - `profiles_insert_own`: `INSERT` for `authenticated`, with check `auth.uid() = user_id`
  - `profiles_update_own`: `UPDATE` for `authenticated`, uses and checks `auth.uid() = user_id`
- Grants observed for `anon`, `authenticated`, and `service_role`: broad table privileges including `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `REFERENCES`, `TRIGGER`, and `TRUNCATE`.

## Triggers And Functions

- `public.profiles` triggers: none
- `auth.users` trigger:
  - `on_auth_user_created`
  - `AFTER INSERT ON auth.users`
  - executes `public.handle_new_user()`
- `public.handle_new_user()`:
  - returns `trigger`
  - language `plpgsql`
  - `SECURITY DEFINER`
  - inserts into `public.profiles (user_id, username)` from `new.id` and `new.raw_user_meta_data ->> 'username'`
- Dependency check:
  - observed trigger dependency: `auth.users.on_auth_user_created -> public.handle_new_user()`

## Retirement Implication

The current table is empty and directly tied to Supabase Auth. Task 03 can replace `public.profiles` with the Clerk-native table after including dependency-safe cleanup for the old `auth.users` trigger and `public.handle_new_user()` function.
