# Task 01: Establish Migration Convention

## Type

Infrastructure

## Context

The live Supabase project currently has no `supabase_migrations.schema_migrations` table, so the repo needs an explicit migration convention before any schema work. Supabase Postgres and buckets are the selected runtime data platform, so the repo needs a Supabase CLI project scaffold and `supabase/migrations/` as the project-owned migration home.

The existing live database has drift from the desired Clerk-native model: `public.profiles` is currently shaped around `auth.users`, while Clerk is the app identity provider. This task does not change that schema. It establishes the rules and local structure required before later tasks replace the old shape safely.

Current local observation:

- No `supabase/` directory exists in the repo yet.
- Local Supabase CLI is installed, but currently reports `2.75.0` while the CLI says `2.98.2` is available.
- Current Supabase platform behavior is changing around Data API exposure: new public tables should include explicit grants when they are intended to be reachable through Supabase Data API clients.
- The intended Supabase project is `Darija To English EXPO` with project ref / MCP `project_id` `npjsersrmvltoxmqdkzd`.

## Implementation

- Initialize the repo's Supabase CLI structure if it is missing.
  - Expected output includes `supabase/config.toml`.
  - Expected migration home is `supabase/migrations/`.
  - Do not link to or push to the live Supabase project as part of this task unless explicitly approved during execution.
- Add a migration README or equivalent note under `supabase/` that documents:
  - `supabase/migrations/` is the canonical home for committed schema changes.
  - New migration files must be created with `supabase migration new <descriptive_name>` instead of hand-naming timestamped SQL files.
  - The local CLI version must be checked with `supabase --version` before migration work.
  - Command details must be discovered with `supabase <command> --help` before use.
  - The current live DB has no recorded Supabase CLI migration history.
  - Remote schema changes should not be made through the Dashboard SQL editor or Table Editor once migrations are adopted.
  - The repo must link only to project ref `npjsersrmvltoxmqdkzd` when a live Supabase project is intentionally linked.
  - Supabase MCP calls must use `project_id: npjsersrmvltoxmqdkzd`.
  - Remote deployment must use a reviewed migration flow, normally `supabase db push --dry-run` followed by `supabase db push` after approval.
  - When the CLI reports remote-history drift or missing history, stop and document the baseline decision instead of forcing a push.
- Add a baseline note for the current live database:
  - Record that `public.profiles` currently points at `auth.users.id`.
  - Record that Clerk remains the app identity source.
  - Record that later migrations must not build app-owned tables around Supabase Auth.
  - Require a preflight read before the replacement migration: inspect existing `profiles` row count, constraints, policies, triggers, and grants.
  - Require an explicit backup/rollback note before dropping, replacing, or rewriting `profiles`, even if the table is expected to be empty.
- Add a Supabase Data API access convention:
  - If a table is intended to be server-only through a direct Postgres/server client, do not grant broad Data API access by default.
  - If a table is intentionally exposed through Supabase Data API clients, include explicit `GRANT` statements and matching RLS in the same migration.
  - Do not use `auth.uid()` policies for Clerk-owned app tables unless a later task deliberately introduces a Clerk-to-Postgres JWT/RLS strategy.
- Add references/resources for:
  - Supabase migration commands.
  - Data API grant/RLS behavior.
  - The local CLI version finding.

## Acceptance Criteria

- `supabase/` CLI project structure exists or the task records why initialization is blocked.
- `supabase/migrations/` exists or the task records why initialization is blocked.
- Migration naming/application notes exist under `supabase/`.
- Notes explicitly say the current live DB has no recorded Supabase CLI migration history.
- Notes preserve Clerk as identity source and `clerk_user_id` as app ownership key.
- Notes explicitly say this task does not apply schema changes to the live DB.
- Notes require `supabase migration new <name>` for new migration files.
- Notes include a local CLI version check and mention that the installed CLI may need upgrade before later migration work.
- Notes identify Supabase project ref / MCP `project_id` `npjsersrmvltoxmqdkzd`.
- Notes define the local test path before live deployment.
- Notes require a dry-run/review step before live `supabase db push`.
- Notes include the current Data API grant/RLS convention for newly created public tables.
- `references/` contains a short source summary for the Supabase docs/changelog used.
- `resources/` contains a command checklist for future migration authors.

## Dependencies

- None

## Technical Notes

- This is planning/scaffolding only; do not apply migrations in this task.
- Do not call Supabase MCP `apply_migration` for this task. It would mutate the live database and create remote-side history without establishing the repo convention first.
- Do not attempt to repair or synthesize live migration history in this task.
- Treat the missing live `supabase_migrations.schema_migrations` table as a baseline risk that must be handled before the first live push.
- Supabase docs currently recommend local migrations through `supabase migration new`, local apply/test through `supabase migration up` or `supabase db reset`, and live deployment through `supabase db push`.
- The installed local CLI reported `2.75.0` during task refinement. The CLI also reported `2.98.2` as available, so later implementers should consider upgrading before using newer commands.
- Later schema tasks depend on this convention.

## Artifact Slots

- `artifacts/`: migration command notes or screenshots from Supabase dashboard if captured later.
- `references/`: relevant Supabase CLI/migration docs excerpts and changelog notes.
- `resources/`: migration helper commands and preflight checklist.
- `notes/`: decisions about migration application, baseline handling, rollback, and whether any live link/push was intentionally skipped.
