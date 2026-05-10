# Foundation Verification Reference

Date checked: 2026-05-09

## Source Context

- Root `AGENTS.md` requires `node --check server/index.mjs`, `npm run typecheck`, `npm run lint`, `npx expo-doctor`, and `/health` checks after code changes.
- `server/AGENTS.md` keeps `/health` public and expects model metadata in the health response.
- `lib/AGENTS.md` states that `EXPO_PUBLIC_*` values are visible to the app bundle.
- Epic 00 verification must prove `profiles.clerk_user_id` exists and `profiles` has no FK to `auth.users`.

## Scope

Foundation verification covers migration structure, DB shape, trigger behavior, server env, server DB client, health response, and secret boundaries.

It does not prove Clerk webhook sync or profile lazy upsert; those belong to Epic 01.

