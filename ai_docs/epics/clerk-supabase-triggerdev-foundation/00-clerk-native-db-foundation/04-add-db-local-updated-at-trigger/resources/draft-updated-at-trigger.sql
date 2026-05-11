-- Draft outline only. Create the real migration with:
-- supabase migration new add_db_local_updated_at_trigger
-- Live target project ref / MCP project_id: npjsersrmvltoxmqdkzd.

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
