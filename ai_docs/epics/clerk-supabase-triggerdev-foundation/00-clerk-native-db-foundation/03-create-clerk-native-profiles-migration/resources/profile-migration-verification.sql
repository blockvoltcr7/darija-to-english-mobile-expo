-- Verification queries for the Clerk-native profiles migration.

select
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'profiles'
order by ordinal_position;

select
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_schema as foreign_table_schema,
  ccu.table_name as foreign_table_name,
  ccu.column_name as foreign_column_name
from information_schema.table_constraints tc
left join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name
  and tc.table_schema = kcu.table_schema
left join information_schema.constraint_column_usage ccu
  on tc.constraint_name = ccu.constraint_name
  and tc.table_schema = ccu.table_schema
where tc.table_schema = 'public'
  and tc.table_name = 'profiles'
order by tc.constraint_type, tc.constraint_name;

select
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename = 'profiles'
order by policyname;

select
  n.nspname as schema_name,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname = 'profiles';

select
  schemaname,
  tablename,
  indexname,
  indexdef
from pg_indexes
where schemaname = 'public'
  and tablename = 'profiles'
order by indexname;

select
  event_object_schema,
  event_object_table,
  trigger_name,
  action_statement
from information_schema.triggers
where event_object_schema in ('public', 'auth')
  and (
    event_object_table = 'profiles'
    or action_statement ilike '%handle_new_user%'
  )
order by event_object_schema, event_object_table, trigger_name;

select gen_random_uuid() as generated_uuid;

