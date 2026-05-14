# Trigger Environment Commands

Run commands from the repo root.

## Inspect Local Contract

```bash
node --check trigger/translate-audio-job.mjs
npm run typecheck
rg -n "TRIGGER_|trigger:deploy|translate-audio-job" trigger.config.mjs package.json .env.example server trigger ai_docs/deployment
```

## Local Dev Baseline

```bash
npm run api
npx trigger.dev dev --config trigger.config.mjs --env-file .env.local --skip-update-check
```

Local dev is not staging verification. Use it only to compare known-good worker behavior.

## Deployment Commands

```bash
npm run trigger:deploy:staging
npm run trigger:deploy:prod
```

Production is documentation-only for this epic unless the user explicitly asks to deploy it.

## Secret Checklist

Configure by name only in Trigger.dev:

- `TRIGGER_PROJECT_REF`
- `TRIGGER_SECRET_KEY`
- `TRIGGER_ENVIRONMENT`
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY` or accepted service-role fallback
- `SUPABASE_AUDIO_ORIGINALS_BUCKET`
- `SUPABASE_TRANSLATION_ARTIFACTS_BUCKET`
- `OPENAI_API_KEY`
- `OPENAI_TRANSCRIPTION_MODEL`
- `OPENAI_CONSOLIDATION_MODEL`
- `OPENAI_TRANSLATION_MODEL`
- `DARIJA_ASR_BASE_URL` or `DARIJA_ASR_URL`
- `DARIJA_ASR_API_KEY`
- `DARIJA_ASR_TIMEOUT_MS`
