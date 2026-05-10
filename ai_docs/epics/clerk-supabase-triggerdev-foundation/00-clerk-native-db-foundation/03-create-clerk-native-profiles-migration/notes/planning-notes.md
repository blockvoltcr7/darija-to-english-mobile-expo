# Planning Notes

Date: 2026-05-09

## Project Scope

Use Supabase project ref / MCP `project_id` `npjsersrmvltoxmqdkzd` for any live migration dry-run, apply, or verification.

## Scope Decision

This task should produce the migration for the Clerk-native `profiles` table. It should not add API profile upsert helpers, Clerk webhooks, or the reusable `updated_at` trigger.

## Key Risk

The old live table is expected to be empty, but destructive SQL must still be gated on Task 02's live inventory. If rows exist, stop and design a data-preserving migration before replacing the table.

## Recommended Migration Shape

- Replace the old Supabase Auth-shaped `public.profiles` only after the Task 02 gate.
- Create `profiles.id uuid` and `profiles.clerk_user_id text not null unique`.
- Enable RLS.
- Avoid `auth.uid()` policies.
- Avoid broad `anon` and `authenticated` grants.
- Grant only server-side access needed for the current API-mediated architecture.
