# Clerk-Native Profiles Reference

Date checked: 2026-05-09

## Source Decisions

- Clerk remains the identity provider.
- `auth.users` is not the app-owned user table.
- App ownership uses `clerk_user_id text`.
- The first persistence path is server-mediated: mobile calls the API, the API verifies Clerk, and the API writes Supabase/Postgres rows.
- Direct mobile-to-Supabase RLS with Clerk claims is a later option.

## Target Table

```sql
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  primary_email text,
  display_name text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
```

## Access Posture

- Enable RLS on `public.profiles`.
- Do not use `auth.uid()` policies for Clerk-owned rows in this first server-mediated version.
- Do not grant broad `anon` or `authenticated` access.
- If using Supabase Data API from the server with a service key, include explicit `service_role` grants in the migration.

## Boundary With Other Tasks

- Task 02 decides whether the old Supabase Auth-shaped table is safely replaceable.
- Task 03 writes the Clerk-native table migration.
- Task 04 adds the reusable `updated_at` trigger behavior.
- Epic 01 adds profile repository helpers, lazy upsert, and Clerk webhooks.

