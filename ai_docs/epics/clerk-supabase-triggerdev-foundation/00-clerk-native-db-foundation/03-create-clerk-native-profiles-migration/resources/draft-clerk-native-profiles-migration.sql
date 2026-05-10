-- Draft outline only. Create the real file with:
-- supabase migration new create_clerk_native_profiles
-- Live target project ref / MCP project_id: npjsersrmvltoxmqdkzd.
--
-- Preconditions:
-- 1. Task 02 inventory confirms public.profiles is empty, or a backup/mapping plan exists.
-- 2. Dependency checks confirm old auth.users trigger/function artifacts are app-owned.
-- 3. A rollback note exists before destructive SQL is applied to live.

begin;

-- Optional, only if gen_random_uuid() is unavailable in the target database.
-- create extension if not exists pgcrypto with schema extensions;

-- Remove old app-owned profile policies before replacing the table.
-- drop policy if exists profiles_select_own on public.profiles;
-- drop policy if exists profiles_insert_own on public.profiles;
-- drop policy if exists profiles_update_own on public.profiles;

-- Remove the old Supabase Auth signup trigger only after dependency checks.
-- drop trigger if exists on_auth_user_created on auth.users;
-- drop function if exists public.handle_new_user();

drop table if exists public.profiles;

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

comment on table public.profiles is 'App-owned profile rows keyed by Clerk user ID.';
comment on column public.profiles.clerk_user_id is 'Clerk user ID; durable app identity key.';

alter table public.profiles enable row level security;

revoke all on table public.profiles from anon;
revoke all on table public.profiles from authenticated;
grant select, insert, update, delete on table public.profiles to service_role;

commit;
