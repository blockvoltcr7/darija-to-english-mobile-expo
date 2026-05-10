# Planning Notes

Date: 2026-05-09

## Project Scope

Use Supabase project ref / MCP `project_id` `npjsersrmvltoxmqdkzd` for any live trigger migration dry-run, apply, or verification.

## Decision

Use a generic `public.set_updated_at()` trigger function and attach it to `public.profiles` with a table-specific trigger name.

## Boundary

This task must not handle Clerk lifecycle events. Clerk profile creation/update/delete belongs to Epic 01 through webhooks and lazy API upsert.
