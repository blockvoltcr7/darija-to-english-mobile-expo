# DB-Local Trigger Boundary

Date checked: 2026-05-09

## Decision

Postgres triggers are allowed for database-local state changes only.

Allowed in this task:

- Maintain `updated_at` on `public.profiles`.
- Return the modified `new` row.

Not allowed in this task:

- React to Clerk signup.
- Add triggers on `auth.users`.
- Call external services.
- Recreate the old `public.handle_new_user()` Supabase Auth profile flow.

## Source Context

- `ai_docs/production-readiness-roadmap/05-clerk-supabase-auth-solidification-plan.md` states that Clerk lifecycle sync belongs to webhooks and lazy profile upsert, not Postgres signup triggers.
- `ai_docs/epics/clerk-supabase-triggerdev-foundation/00-clerk-native-db-foundation/03-create-clerk-native-profiles-migration/task.md` owns the `profiles.updated_at` column.
- Task 04 owns automatic mutation of `updated_at`.

