# Deploy Source Map

## Files That Define The Bundle

- `trigger.config.mjs`: project ref, task directory, retry defaults, and max duration.
- `trigger/translate-audio-job.mjs`: exported `translateAudioJob` task with id `translate-audio-job`.
- `server/translation-pipeline.mjs`: imported by the Trigger task; must be present in the deployed bundle.
- `package.json`: deploy scripts and Trigger package versions.
- `trigger/AGENTS.md`: logging and task-identifier rules.

## Development Worker Script

`package.json` currently defines:

```bash
trigger.dev dev --config trigger.config.mjs
```

Run it through npm with local env loading:

```bash
npm run trigger:dev -- --env-file .env.local --skip-update-check
```

The production script uses the same config with `deploy --env prod`, but production is out of scope.

## Verification Anchors

- Registered task id must remain `translate-audio-job`.
- The worker must log `jobId`, Trigger `runId`, and attempt number at task start.
- Production deployment is out of scope unless explicitly requested.
