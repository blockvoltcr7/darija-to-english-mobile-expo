# Implementation Review - 2026-05-10

## Scope

- Added `@supabase/supabase-js`.
- Added `server/db.mjs`.
- Updated `server/index.mjs` with a sanitized `/health/supabase` smoke endpoint.
- Target project ref: `npjsersrmvltoxmqdkzd`.

## Implementation

`server/db.mjs` exports:

- `SUPABASE_PROJECT_REF`
- `getSupabaseAdminClient()`
- `checkSupabaseConnection()`

The client:

- imports config only from `server/env.mjs`
- uses `env.SUPABASE_URL`
- uses `env.SUPABASE_SECRET_KEY`
- creates a singleton client
- disables auth session persistence, auto refresh, and URL session detection

The smoke helper:

- checks `public.profiles` with a head/count query
- returns a sanitized status object
- does not return keys, key prefixes, or Supabase URLs

## Verification

Passed:

- `node --check server/env.mjs`
- `node --check server/db.mjs`
- `node --check server/index.mjs`
- `npm run typecheck`
- `npm run lint`
- static import-boundary check found no `app/` or `lib/` imports of server env/db modules
- import smoke confirmed `server/db.mjs` exports the expected API and project ref without running a DB query

Per the current execution rule, production DB/schema checks use Supabase MCP. The app DB-client smoke function was implemented but not used to mutate production data.

## Notes

No profile repository helpers were added. Epic 01 owns `getOrCreateProfile`, `upsertProfileFromClerkUser`, and `softDeleteProfile`.
