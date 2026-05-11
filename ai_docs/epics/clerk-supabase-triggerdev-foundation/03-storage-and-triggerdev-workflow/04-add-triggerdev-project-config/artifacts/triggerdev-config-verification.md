# Trigger.dev Config Verification

Task: `add-triggerdev-project-config`
Project ref: `proj_tehveeweadzwantwpvpr`
Date: 2026-05-10

## Result

Added root Trigger.dev config:

- `trigger.config.mjs`
- task directory: `./trigger`
- project ref fallback: `proj_tehveeweadzwantwpvpr`
- default retries: 2 attempts outside dev
- default max duration: 900 seconds

Added npm scripts:

- `npm run trigger:dev`
- `npm run trigger:deploy:staging`
- `npm run trigger:deploy:prod`

Added backend/worker-only env placeholders:

- `TRIGGER_PROJECT_REF`
- `TRIGGER_SECRET_KEY`
- `TRIGGER_ENVIRONMENT`

`server/env.mjs` now rejects `EXPO_PUBLIC_TRIGGER_*` names that look like server secrets.

## Package Decision

Pinned coherent Trigger.dev package versions:

- `@trigger.dev/sdk`: `4.4.5`
- `@trigger.dev/build`: `4.4.5`
- `trigger.dev`: `4.4.5`
- `zod`: `4.4.3`

The installed Trigger.dev CLI reports `4.4.5`.

`npm install` surfaced pre-existing Clerk/React peer warnings and npm audit findings. Those were not introduced as functional blockers for this Trigger config task, but they remain visible in npm output.

## MCP Project Context

Trigger MCP confirmed:

- Organization: `Idrissi Org`
- Project: `Idrissi Project`
- Project ref: `proj_tehveeweadzwantwpvpr`
- Current dev worker: `20260227.21`
- Current dev worker SDK: `4.4.1`
- Existing registered tasks: 28 unrelated tasks under `src/trigger/*`

This app therefore uses its own root config and will introduce the stable task ID `translate-audio-job` in the next task instead of relying on existing account tasks.

## CLI Verification

Commands run:

```bash
npx trigger.dev --version
npx trigger.dev deploy --dry-run --config trigger.config.mjs --env staging --skip-update-check
npx trigger.dev deploy --dry-run --config trigger.config.mjs --env prod --skip-update-check
```

Results:

- CLI version returned `4.4.5`.
- Staging dry-run reached account/project lookup, then failed because the staging environment does not exist for the project.
- Prod dry-run reached account/project lookup and config loading, then failed with `No trigger files found`.

The prod dry-run failure is expected at this phase because `trigger/` intentionally has no task file until `add-triggerdev-translation-task`.

## Docs Checked

- Manual setup: https://trigger.dev/docs/manual-setup
- Config file: https://trigger.dev/docs/config/config-file
- Max duration: https://trigger.dev/docs/runs/max-duration
- Deploy environment variables: https://trigger.dev/docs/deploy-environment-variables
