# Retirement Decision - 2026-05-10

## Decision

Replace the empty Supabase Auth-shaped `public.profiles` table in Task 03 with a Clerk-native `public.profiles` table.

## Rationale

Read-only live inspection against the intended Supabase project ref `npjsersrmvltoxmqdkzd` found:

- `public.profiles` row count is `0`.
- `auth.users` row count is `0`.
- The current `profiles` table uses `user_id uuid` as primary key.
- `profiles.user_id` has a foreign key to `auth.users.id`.
- Current profile policies use `auth.uid()`.
- `auth.users` has an app-created `on_auth_user_created` trigger that calls `public.handle_new_user()`.
- `public.handle_new_user()` inserts into `public.profiles (user_id, username)`.

Because no rows exist, there is no live profile data to preserve or map. A clean replacement is safer than carrying a temporary `user_id` compatibility column into the Clerk-native design.

## Task 03 Requirements

The replacement migration should:

- Drop the old `auth.users.on_auth_user_created` trigger before dropping the function.
- Drop `public.handle_new_user()` only after dependency checks show no remaining users.
- Replace `public.profiles` rather than alter it in place around the old `user_id` primary key.
- Create `profiles.clerk_user_id text not null unique`.
- Avoid any foreign key to `auth.users`.
- Avoid `auth.uid()` policies.
- Keep RLS enabled as defense in depth.
- Avoid broad `anon` or `authenticated` Data API grants for the server-mediated architecture.

## Backup And Rollback

No data export is required before replacement because both `public.profiles` and `auth.users` are empty. The rollback path is to restore the old shape from migration history/git if needed, but the preferred recovery path before live apply is to review and dry-run the generated migration.

If a later preflight finds rows in `public.profiles`, stop and replace this decision with an explicit export and Clerk mapping plan.
