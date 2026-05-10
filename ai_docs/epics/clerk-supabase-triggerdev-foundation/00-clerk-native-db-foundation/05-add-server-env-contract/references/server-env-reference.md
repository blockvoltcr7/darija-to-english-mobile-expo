# Server Env Reference

Date checked: 2026-05-09

## Project Scope

- Supabase project name: `Darija To English EXPO`
- Supabase project ref: `npjsersrmvltoxmqdkzd`
- Expected project URL: `https://npjsersrmvltoxmqdkzd.supabase.co`

## Current Local Files

- `server/index.mjs` currently calls `dotenv.config({ path: ['.env.local', '.env'] })` and reads `process.env` directly.
- `.env.example` documents current API, Clerk, Darija ASR, and OpenAI variables.
- `lib/config.ts` reads `EXPO_PUBLIC_API_BASE_URL`.
- `app/_layout.tsx` reads `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`.
- `lib/AGENTS.md` states that `EXPO_PUBLIC_*` values are visible to the app bundle.

## Supabase Key Guidance

Supabase's API key docs distinguish public publishable keys from backend-only secret keys. Secret keys and legacy `service_role` keys are for backend components and must not be exposed in browser/mobile bundles.

Recommended server env names for this project:

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` only as a legacy fallback if needed

Do not add secret-bearing `EXPO_PUBLIC_SUPABASE_*` variables for the current server-mediated architecture.
