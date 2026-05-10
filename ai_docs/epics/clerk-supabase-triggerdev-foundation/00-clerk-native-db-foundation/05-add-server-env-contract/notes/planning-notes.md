# Planning Notes

Date: 2026-05-09

## Project Scope

Server env should point at Supabase project ref `npjsersrmvltoxmqdkzd` (`https://npjsersrmvltoxmqdkzd.supabase.co`).

## Decision

Create `server/env.mjs` as the single server-side env boundary. Keep Expo public config in `lib/config.ts` and `app/_layout.tsx`.

## Secret Boundary

Supabase secret credentials belong only in server env. The mobile app should continue to call the app API with Clerk tokens rather than talking directly to Supabase.
