# Development Worker Commands

Run from the repo root.

## Preflight

```bash
node --check trigger/translate-audio-job.mjs
node --check server/translation-pipeline.mjs
rg -n "translate-audio-job|TRIGGER_PROJECT_REF|trigger:deploy" trigger.config.mjs trigger package.json server
```

## Development Worker

```bash
npm run trigger:dev -- --env-file .env.local --skip-update-check
```

Capture sanitized output:

- project/environment label
- registered task id
- worker connection or run id if present
- URL/dashboard pointer if present
- no secret values

## Production Path

```bash
npm run trigger:deploy:prod
```

Do not run production deploy in this task unless the user explicitly asks.
