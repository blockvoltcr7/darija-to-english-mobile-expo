# Trigger Development Environment Checklist

Execution-time artifact from Phase 1 configuration review.

## Trigger Project

- Project ref: `proj_tehveeweadzwantwpvpr`
- Environment checked: Development
- CLI/user account: not printed; use local Trigger CLI auth/profile
- Date/time: `2026-05-15T18:36:13Z`

## Secret Presence

Do not paste values.

- [x] `.env.local` exists.
- [x] `TRIGGER_SECRET_KEY` is present in `.env.local`.
- [x] `SUPABASE_URL` is present in `.env.local`.
- [x] `SUPABASE_SECRET_KEY` is present in `.env.local`.
- [x] `SUPABASE_SERVICE_ROLE_KEY` is also present as a legacy-compatible fallback.
- [x] `OPENAI_API_KEY` is present in `.env.local`.
- [x] `DARIJA_ASR_BASE_URL` is present in `.env.local`.
- [x] `DARIJA_ASR_API_KEY` is present in `.env.local`.
- [x] Model override variables are documented in `.env.example`; local defaults are acceptable unless intentionally changed.

## Compatibility

- [x] Worker and local API should both load `.env.local`.
- [x] Worker targets the same Supabase resources as the selected local API path.
- [x] Worker can access private storage buckets used by queued jobs when Supabase secret env values are loaded.
- [x] Environment label matches Development runtime scope through `server/env.mjs` default `TRIGGER_ENVIRONMENT=dev`.
- [x] Hosted Cloud Run API is not selected for this development-worker QA path because its runbook still documents `TRIGGER_ENVIRONMENT=staging`.

## Blockers

- None for Phase 1.
- Next action: run `npm run trigger:dev -- --env-file .env.local --skip-update-check` in Phase 2 and record sanitized worker connection evidence.
