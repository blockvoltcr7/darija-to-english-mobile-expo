# Task 05: Add Server Env Contract

## Type

Infrastructure

## Context

`server/index.mjs` currently reads environment variables directly near the top of the file. Supabase server access adds secret-bearing configuration that must remain server-side and be validated clearly before the API starts doing profile, storage, and job persistence work.

The current public mobile config path is separate: `lib/config.ts` reads `EXPO_PUBLIC_API_BASE_URL`, and `app/_layout.tsx` reads `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`. Expo bundles `EXPO_PUBLIC_*` variables into the app, so Supabase secret keys must never use that prefix.

## Implementation

- Add `server/env.mjs` and move server-only environment parsing there.
- Preserve existing `dotenv.config({ path: ['.env.local', '.env'] })` behavior so local env loading does not regress.
- Export a single validated `env` object for `server/index.mjs` and later `server/db.mjs`.
- Include existing server values:
  - `PORT`, `HOST`, `MAX_JSON_BODY_SIZE`
  - `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
  - `DARIJA_ASR_BASE_URL` / `DARIJA_ASR_URL`, `DARIJA_ASR_API_KEY`, `DARIJA_ASR_TIMEOUT_MS`
  - `OPENAI_API_KEY`, `OPENAI_TRANSCRIPTION_MODEL`, `OPENAI_CONSOLIDATION_MODEL`, `OPENAI_TRANSLATION_MODEL`
- Add Supabase server values:
  - `SUPABASE_URL`
  - preferred: `SUPABASE_SECRET_KEY`
  - legacy fallback only if needed: `SUPABASE_SERVICE_ROLE_KEY`
- Reject configs that place Supabase secret credentials in `EXPO_PUBLIC_*` env vars.
- Update `.env.example` with server-only Supabase placeholders and comments explaining that these are not mobile env vars.
- Refactor `server/index.mjs` to consume `env` without changing request behavior.
- Add a startup/config verification path, such as importing `server/env.mjs` with `node --check` and starting the API with missing Supabase vars to confirm the error is readable.

## Acceptance Criteria

- [ ] `server/env.mjs` exists and centralizes server env parsing.
- [ ] `server/index.mjs` no longer reads required server secrets directly from `process.env`.
- [ ] Missing required server env produces a clear startup/config error.
- [ ] Existing Clerk/OpenAI/Darija ASR behavior and defaults are preserved.
- [ ] `.env.example` documents `SUPABASE_URL` and a server-only Supabase secret key.
- [ ] No `EXPO_PUBLIC_SUPABASE_*` secret variable is added.
- [ ] No mobile file imports `server/env.mjs` or server secrets.
- [ ] `node --check server/index.mjs` and `node --check server/env.mjs` pass.

## Dependencies

- Depends On: establish-migration-convention
- Blocks: add-server-supabase-db-client

## Technical Notes

- Keep mobile public config separate from server-only config.
- Use the existing `dotenv.config({ path: ['.env.local', '.env'] })` behavior unless intentionally refactored.
- Supabase currently recommends `sb_secret_...` secret keys for backend components where available; legacy `service_role` remains common but should be treated as server-only.
- `package-lock.json` is present, so dependency installs in later tasks should use `npm` unless the repo changes package manager.
- Do not print actual env values in errors or logs. Error messages should name missing variables only.
- Keep `/health` public, but only expose booleans such as `supabase: true`, never URLs or key prefixes.

## Artifact Slots

- `artifacts/`: env matrix, startup-error examples, and health response examples.
- `references/`: current `.env.example`, server config notes, Supabase API key docs.
- `resources/`: local env validation commands and mobile secret-boundary checks.
- `notes/`: secret-boundary decisions and any secret-key vs service-role fallback decision.
