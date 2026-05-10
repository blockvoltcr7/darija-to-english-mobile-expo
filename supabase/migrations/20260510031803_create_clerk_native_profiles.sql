-- Replace the empty Supabase Auth-shaped profile table with a Clerk-native
-- app profile table.
--
-- Live target project ref / MCP project_id: npjsersrmvltoxmqdkzd.
-- Gate: Task 02 live inventory on 2026-05-10 found public.profiles row count 0.

begin;

do $$
declare
  profile_count bigint;
begin
  if to_regclass('public.profiles') is not null then
    select count(*) into profile_count from public.profiles;

    if profile_count > 0 then
      raise exception
        'Refusing to replace public.profiles because it contains % rows. Create an export and Clerk mapping plan first.',
        profile_count;
    end if;
  end if;
end
$$;

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

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

comment on table public.profiles is
  'App-owned profile rows keyed by Clerk user ID.';

comment on column public.profiles.clerk_user_id is
  'Clerk user ID; durable app ownership key for server-mediated access.';

alter table public.profiles enable row level security;

revoke all on table public.profiles from anon;
revoke all on table public.profiles from authenticated;

grant select, insert, update, delete on table public.profiles to service_role;

commit;
