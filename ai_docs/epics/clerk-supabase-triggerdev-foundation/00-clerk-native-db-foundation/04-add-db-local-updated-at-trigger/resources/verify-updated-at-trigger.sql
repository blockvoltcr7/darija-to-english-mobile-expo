-- Run against local/dev after the profiles migration and updated_at trigger migration.

insert into public.profiles (clerk_user_id, primary_email, display_name)
values ('user_test_updated_at', 'updated-at@example.test', 'Before Update')
on conflict (clerk_user_id)
do update set display_name = excluded.display_name
returning id, clerk_user_id, created_at, updated_at;

select pg_sleep(1);

update public.profiles
set display_name = 'After Update'
where clerk_user_id = 'user_test_updated_at'
returning id, clerk_user_id, created_at, updated_at;

select
  event_object_schema,
  event_object_table,
  trigger_name,
  action_timing,
  event_manipulation,
  action_statement
from information_schema.triggers
where trigger_name = 'profiles_set_updated_at'
   or event_object_table = 'users'
order by event_object_schema, event_object_table, trigger_name;

