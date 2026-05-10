-- Add a database-local updated_at trigger for mutable app tables.
--
-- Live target project ref / MCP project_id: npjsersrmvltoxmqdkzd.
-- Applied through Supabase MCP per project execution rule.

begin;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

commit;
