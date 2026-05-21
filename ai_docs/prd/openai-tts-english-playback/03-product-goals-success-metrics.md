# 03 Product Goals And Success Metrics

## Goals

1. Generate spoken English audio after a translation job produces final English text.
2. Keep all OpenAI TTS calls and credentials server-side.
3. Store generated speech as a private app artifact tied to the Clerk user and translation job.
4. Let the mobile app play generated audio without exposing provider secrets or raw storage access.
5. Preserve existing text-first translation behavior if TTS fails.
6. Make TTS generation idempotent across Trigger retries and repeated polling.
7. Record enough metadata to debug cost, provider failures, playback issues, and model choices.

## Success Metrics

| Metric | Target | How To Verify |
| --- | --- | --- |
| TTS generation availability | Successful translation jobs with TTS enabled produce one English audio artifact. | Query artifact row for completed job and confirm storage object exists. |
| No client-side provider secrets | Expo bundle and API responses do not expose `OPENAI_API_KEY` or TTS provider secrets. | Search `EXPO_PUBLIC_*`, response payloads, and mobile code. |
| Authenticated playback | Only the owning Clerk user can request the generated audio. | Sign in as a different test user and confirm download route returns 404/403. |
| Translation failure isolation | Text translation remains visible even when TTS generation fails. | Force provider failure and confirm `GET /v1/translations/:id` returns text result plus failed TTS metadata. |
| Idempotency | Re-running the same Trigger job does not create duplicate TTS artifacts for same text/provider config. | Force retry or rerun and compare artifact count and object keys. |
| Mobile playback | iOS development build can play the generated file. | Fresh-user QA with simulator audio fixture and Play button. |
| Diagnostics | Logs include `traceId`, `jobId`, provider, model, voice, format, char count, bytes, and status without full private text. | Inspect API/Trigger logs for a completed job. |
| Type safety | Client and server TypeScript checks pass. | Run `npm run typecheck`. |
| Existing route compatibility | Existing upload, polling, history, and text result fields still work. | Run current fresh-user QA path and verify existing visible sections. |
