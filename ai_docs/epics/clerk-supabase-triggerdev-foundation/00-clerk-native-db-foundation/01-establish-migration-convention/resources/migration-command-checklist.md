# Migration Command Checklist

Use this checklist when implementing the migration convention or authoring later migrations.

## Project Scope

Use this Supabase project for all live CLI/MCP work in this repo:

```text
project_ref / project_id: npjsersrmvltoxmqdkzd
project_name: Darija To English EXPO
```

For Supabase MCP calls, pass `project_id: "npjsersrmvltoxmqdkzd"` when the tool schema requires it.

## Preflight

```bash
supabase --version
supabase --help
supabase migration --help
supabase db --help
```

If the repo has no Supabase project scaffold:

```bash
supabase init
```

## Create A Migration

Always create migration files through the CLI:

```bash
supabase migration new <descriptive_name>
```

Then edit the generated SQL file under `supabase/migrations/`.

## Local Verification

Before a live push:

```bash
supabase migration list --local
supabase db reset
```

If local Docker/Supabase stack is not available, record the blocker in the task notes and do not claim DB verification.

## Live Deployment Review

Do not run these in planning tasks. Use them only after schema SQL has been reviewed and the project is intentionally linked.

```bash
supabase link --project-ref npjsersrmvltoxmqdkzd
supabase db push --dry-run
supabase db push
```

If the live project has no CLI migration history or reports drift, stop and document the baseline decision before pushing.

## Baseline Checks For The Existing Live DB

Before replacing the current Supabase Auth-shaped `profiles` table, inspect:

```sql
select count(*) from public.profiles;
select * from information_schema.table_constraints where table_schema = 'public' and table_name = 'profiles';
select * from pg_policies where schemaname = 'public' and tablename = 'profiles';
```

Also inspect triggers, indexes, grants, and whether any app path still expects `profiles.user_id`.
