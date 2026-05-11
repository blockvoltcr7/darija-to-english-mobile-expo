# Clerk Supabase Trigger.dev Foundation Epics

Date: 2026-05-09

## Goal

Move the app from working Clerk authentication to a production-ready backend foundation:

- Clerk remains the identity provider.
- Supabase Postgres stores app-owned state.
- Supabase private buckets store audio and generated artifacts.
- Trigger.dev runs long-running translation workflows.
- The mobile app never receives server-side Supabase, OpenAI, Modal, or Trigger.dev secrets.

## Source Plans

- `ai_docs/production-readiness-roadmap/05-clerk-supabase-auth-solidification-plan.md`
- `ai_docs/production-readiness-roadmap/03-postgres-and-data-model.md`
- `ai_docs/visuals/clerk-supabase-triggerdev-foundation/`

## Architecture Rules

- Do not build new app tables around `auth.users`.
- App ownership uses `clerk_user_id text`.
- Postgres triggers are only for database-local side effects.
- Clerk lifecycle sync uses webhook events and lazy API profile upsert.
- Supabase is the source of truth for jobs/results/storage metadata.
- Trigger.dev executes async work; it does not own durable state.

## Epic Order

1. `00-clerk-native-db-foundation/`
2. `01-clerk-profile-sync/`
3. `02-translation-persistence-history/`
4. `03-storage-and-triggerdev-workflow/`
5. `04-usage-controls-and-release-readiness/`

## Task Folder Contract

Each epic uses folder-shaped tasks:

```text
<epic-folder>/
  epic-overview.md
  01-task-slug/
    task.md
    artifacts/
    references/
    resources/
    notes/
```

`task.md` is the canonical task spec. The support folders are reserved for generated diagrams, SQL drafts, screenshots, copied references, helper scripts, sample payloads, QA notes, blockers, and decisions.

## Milestone Definition

The first production milestone is complete when:

- A Clerk-authenticated user creates or updates a `profiles` row in Supabase.
- A translation creates durable job/result/provider rows.
- Original audio is stored in a private bucket.
- A Trigger.dev task can process a job and write the final result.
- The mobile app can show the user's own translation history.
- Unauthorized or cross-user access is rejected server-side.
