# Production Smoke Test Checklist

## Preflight

- Confirm production API URL is not local or staging-backed unless explicitly approved as non-production evidence.
- Confirm production iOS build profile/channel/version/commit.
- Confirm no local `npm run trigger:dev` worker is required for production runs.
- Confirm short non-sensitive audio fixture is available.

## Health

- Run `curl -sS <production-url>/health`.
- Run `curl -sS <production-url>/health/supabase` when production Supabase is configured.
- Stop and record blocker if health checks do not match the production target.

## App Flow

- Sign in or create a fresh production Clerk test user.
- Submit the short fixture from the iOS build.
- Record `traceId`, `jobId`, `triggerRunId`, timestamps, and status transitions.
- Verify English translation/result presence, consolidated Darija presence, history visibility, and TTS playback metadata if enabled.

## Evidence Rules

Allowed: safe IDs, statuses, timings, build profile/channel/version, API URL, model names, result-field presence.

Disallowed: Clerk session tokens, API keys, `.env` values, private audio, full transcripts, provider request/response bodies, generated audio bytes.
