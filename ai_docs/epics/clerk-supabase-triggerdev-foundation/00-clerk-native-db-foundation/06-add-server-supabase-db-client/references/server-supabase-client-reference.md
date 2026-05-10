# Server Supabase Client Reference

Date checked: 2026-05-09

## Local Source Context

- `package.json` does not currently include `@supabase/supabase-js`.
- `package-lock.json` is present, so use npm for dependency installation unless the repo changes package manager.
- `server/index.mjs` is the Node/Express API entrypoint.
- `server/env.mjs` from Task 05 is the intended source of server-only Supabase config.
- Mobile code in `app/` and `lib/` must not import server modules.

## Client Direction

Use a server-side Supabase client because later epics need both Postgres/Data API and private Storage bucket access.

The module should expose a narrow API, such as:

- `getSupabaseAdminClient()`
- `checkSupabaseConnection()`

Repository helpers for profiles belong to Epic 01, not this task.

## Security Direction

Supabase secret keys and legacy `service_role` keys are backend-only and can bypass RLS assumptions. Later API code must still filter user-owned data by the authenticated Clerk user ID.

