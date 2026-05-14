# Deploy Commands

Run from the repo root.

## Preflight

```bash
node --check trigger/translate-audio-job.mjs
node --check server/translation-pipeline.mjs
rg -n "translate-audio-job|TRIGGER_PROJECT_REF|trigger:deploy" trigger.config.mjs trigger package.json server
```

## Staging Deploy

```bash
npm run trigger:deploy:staging
```

Capture sanitized output:

- project/environment label
- deployed task id
- deployment id or version if present
- URL/dashboard pointer if present
- no secret values

## Production Path

```bash
npm run trigger:deploy:prod
```

Do not run production deploy in this task unless the user explicitly asks.
