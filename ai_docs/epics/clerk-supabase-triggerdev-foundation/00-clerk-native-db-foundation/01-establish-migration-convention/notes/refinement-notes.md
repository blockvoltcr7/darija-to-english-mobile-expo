# Refinement Notes

Date: 2026-05-09

## What Was Missing

- The task did not mention that the repo currently has no `supabase/` directory.
- The task did not define whether `supabase init` is expected.
- The task did not require migration files to be created through `supabase migration new`.
- The task did not distinguish local testing from live deployment.
- The task did not say how to handle a live database with no CLI migration history.
- The task did not require a dry-run/review step before `supabase db push`.
- The task did not include the current Supabase Data API explicit-grant behavior.
- The task did not require preflight inspection of existing `profiles` data and constraints before a later replacement migration.

## Decision

Keep Task 01 as scaffolding and convention only. It may create local Supabase project structure and documentation, but it must not mutate the live database.

