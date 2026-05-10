# Retirement Decision Template

Use this note when executing the task.

## Live Inventory Summary

- `public.profiles` row count:
- Current primary key:
- Current foreign keys:
- Current RLS policies:
- Current grants:
- Current triggers:
- `auth.users` trigger calling `public.handle_new_user()`:
- `public.handle_new_user()` dependencies:

## Decision

Choose one:

- Replace empty `public.profiles` in Task 03.
- Rename legacy `public.profiles` and create a new Clerk-native table.
- Preserve data through an explicit row-mapping migration.

## Rationale

Explain why this option is safe for the current live DB.

## Rollback / Backup

- Backup/export location or reason not needed:
- Rollback strategy:
- Manual verification query:

