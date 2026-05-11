# Auth Shape Retirement Reference

Date checked: 2026-05-09

## Project Scope

- Live DB inspection must target Supabase project ref / MCP `project_id` `npjsersrmvltoxmqdkzd`.
- Project name: `Darija To English EXPO`.

## Local Source Context

- `ai_docs/production-readiness-roadmap/05-clerk-supabase-auth-solidification-plan.md` states that Clerk remains the identity provider and app tables should not be built around `auth.users`.
- `ai_docs/production-readiness-roadmap/03-postgres-and-data-model.md` defines `clerk_user_id text not null unique` as the durable identity key for `profiles`.
- `ai_docs/epics/clerk-supabase-triggerdev-foundation/README.md` states that app ownership uses `clerk_user_id text` and Postgres triggers are only for database-local side effects.
- `server/index.mjs` currently verifies Clerk with `requireClerkSession` and exposes `req.clerkAuth.userId`.
- `lib/api.ts` sends the Clerk session token as `Authorization: Bearer <token>` to `/v1/translate-audio`.

## Supabase Reference Context

- Supabase can be used with Clerk as a third-party authentication provider, but this project is not relying on direct mobile-to-Supabase access for the first persistence path.
- Supabase's Clerk docs describe Clerk-compatible RLS through Clerk session token claims. That is a later option, not the first server-mediated architecture.
- For server-mediated access, the API verifies Clerk and queries Supabase/Postgres server-side while filtering by `clerk_user_id`.

## Decision Boundary

Retiring the old Supabase Auth profile shape means removing app-owned dependence on:

- `profiles.user_id`
- `profiles.user_id -> auth.users.id`
- profile RLS policies based on `auth.uid()`
- the old `auth.users` insert trigger that populates `profiles`

It does not mean deleting Supabase Auth system tables or disabling Supabase platform features globally.
