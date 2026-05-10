-- Harden the database-local updated_at trigger function.
--
-- Live target project ref / MCP project_id: npjsersrmvltoxmqdkzd.
-- Applied through Supabase MCP per project execution rule.

begin;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

commit;
