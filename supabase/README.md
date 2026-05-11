# Supabase Migration Convention

This repo uses Supabase Postgres and Storage as backend infrastructure while Clerk remains the app identity provider.

## Project Target

- Supabase project name: `Darija To English EXPO`
- Supabase project ref / MCP `project_id`: `npjsersrmvltoxmqdkzd`
- Supabase URL: `https://npjsersrmvltoxmqdkzd.supabase.co`

All live Supabase CLI links for this repo must target:

```bash
supabase link --project-ref npjsersrmvltoxmqdkzd
```

All Supabase MCP calls that accept a project id must use:

```text
project_id: npjsersrmvltoxmqdkzd
```

## Migration Home

Committed schema changes live in:

```text
supabase/migrations/
```

Create migration files through the Supabase CLI:

```bash
supabase --version
supabase migration new <descriptive_name>
```

Do not hand-name timestamped SQL migration files. Edit the generated file under `supabase/migrations/`.

Before using a CLI command, inspect its current help output:

```bash
supabase --help
supabase migration --help
supabase db --help
supabase db push --help
```

The local CLI observed during setup was `2.75.0`, while the CLI reported `2.98.2` as available. Recheck the installed version before future migration work and upgrade if a required command or flag is unavailable.

## Baseline State

The live database currently has no recorded Supabase CLI migration history table at `supabase_migrations.schema_migrations`. Treat the first live push as a baseline-risk decision, not a routine deployment.

The existing live `public.profiles` table is Supabase Auth-shaped:

- `user_id uuid` primary key
- foreign key to `auth.users.id`
- policies based on `auth.uid()`
- `auth.users` insert trigger calling `public.handle_new_user()`

Clerk is the app identity source. Future app-owned tables must use Clerk ownership keys such as `clerk_user_id`, not `auth.users.id`, unless a later design explicitly adopts Clerk-aware Postgres JWT/RLS.

Before replacing or rewriting `public.profiles`, perform a read-only preflight against project `npjsersrmvltoxmqdkzd`:

- row count
- columns and defaults
- primary key, unique constraints, foreign keys, and indexes
- RLS enabled state and policies
- grants for `anon`, `authenticated`, and `service_role`
- triggers on `public.profiles`
- `auth.users` triggers related to `public.handle_new_user()`
- `public.handle_new_user()` definition and dependencies

Record backup and rollback notes before dropping, replacing, or rewriting `profiles`, even if the table is expected to be empty.

## Local And Live Flow

Preferred flow:

```bash
supabase migration new <descriptive_name>
supabase migration list --local
supabase db reset
```

Only after migration SQL is reviewed and the project is intentionally linked:

```bash
supabase db push --dry-run
supabase db push
```

If the CLI reports remote-history drift, missing history, or unexpected remote migrations, stop and document the baseline decision. Do not force a push or repair migration history without an explicit review.

Avoid Dashboard SQL Editor and Table Editor schema changes after adopting migrations because they bypass local migration history.

## Data API And RLS Convention

For server-owned app tables, do not grant broad Data API access to `anon` or `authenticated` by default.

If a table is intentionally exposed through Supabase Data API clients, include explicit `GRANT` statements, RLS enablement, and matching policies in the same migration.

Do not use `auth.uid()` policies for Clerk-owned app tables in the current server-mediated architecture.

The mobile app should continue calling the app API. Server code owns Supabase secret credentials.
