# Task 06: Add Server Supabase DB Client

## Type

Code

## Context

The API needs server-only access to Supabase Postgres for profiles, jobs, results, webhook events, usage, and storage metadata. It will also need private bucket access in Epic 03. The mobile app must never receive Supabase secret credentials.

Task 05 centralizes server env in `server/env.mjs`; this task adds the server-only Supabase client module that later profile sync and translation persistence code will use.

The server client must connect to Supabase project ref `npjsersrmvltoxmqdkzd` via `SUPABASE_URL=https://npjsersrmvltoxmqdkzd.supabase.co`.

## Implementation

- Install the server/client dependency with npm if it is not already present:
  - `npm install @supabase/supabase-js`
- Add `server/db.mjs`.
- Import `env` from `server/env.mjs`.
- Initialize a singleton Supabase admin/server client using `SUPABASE_URL` and `SUPABASE_SECRET_KEY` or the approved `SUPABASE_SERVICE_ROLE_KEY` fallback.
- Export a small stable API for later tasks, for example:
  - `getSupabaseAdminClient()`
  - optionally `checkSupabaseConnection()` for smoke testing
- Configure the client so it does not try to persist auth sessions in a server process.
- Add a safe smoke query path that can verify the connection without exposing secrets, such as selecting one row from `public.profiles` or running a lightweight metadata query after migrations exist.
- Update `server/index.mjs` only enough to use the new module for health/smoke status if appropriate; do not add profile upsert behavior in this task.
- Confirm no `app/` or `lib/` file imports `server/db.mjs` or receives Supabase secret config.

## Acceptance Criteria

- [ ] `@supabase/supabase-js` is added to `package.json` and `package-lock.json` if not already installed.
- [ ] `server/db.mjs` exists and imports config only from `server/env.mjs`.
- [ ] Supabase client uses server-only credentials.
- [ ] Supabase client targets project ref `npjsersrmvltoxmqdkzd`.
- [ ] Client creation is singleton or otherwise avoids unnecessary per-request recreation.
- [ ] Auth session persistence is disabled for server usage.
- [ ] Server code can run a safe Supabase/Postgres smoke query.
- [ ] No Expo/mobile file imports the DB client.
- [ ] No service or secret key is exposed through `EXPO_PUBLIC_*`, logs, health response, or API responses.
- [ ] `node --check server/db.mjs` and `node --check server/index.mjs` pass.

## Dependencies

- Depends On: add-server-env-contract
- Depends On: create-clerk-native-profiles-migration
- Blocks: add-foundation-verification-docs
- Blocks: 01-clerk-profile-sync/add-profile-repository-helpers

## Technical Notes

- Prefer a server Supabase client if it will also support private bucket access in later epics.
- Keep helper names stable enough for Epic 01 profile sync.
- Supabase secret keys and legacy `service_role` keys bypass normal user-level authorization assumptions. Every API query must still filter by authenticated `clerk_user_id` in later tasks.
- Do not create repository helpers here. Epic 01 owns `getOrCreateProfile`, `upsertProfileFromClerkUser`, and `softDeleteProfile`.
- Keep direct mobile-to-Supabase client setup out of scope.
- If the project later chooses direct Postgres instead of Supabase Data API, record that decision before replacing this client abstraction.

## Artifact Slots

- `artifacts/`: DB connectivity snippets, safe smoke output, and dependency-install output.
- `references/`: server/data-flow visual references and Supabase API key guidance.
- `resources/`: local smoke commands and import-boundary checks.
- `notes/`: client choice, credential-boundary notes, and any secret-key/service-role compatibility decision.
