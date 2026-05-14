# Environment Decisions

## Current Defaults

- Trigger project fallback in `trigger.config.mjs`: `proj_tehveeweadzwantwpvpr`.
- API staging host: Google Cloud Run service `darija-api-staging`.
- API staging URL: `https://darija-api-staging-nwjxqrn2ra-uc.a.run.app`.
- Cloud Run staging API uses `TRIGGER_ENVIRONMENT=staging`.

## Decisions To Confirm During Execution

- Whether Trigger.dev `staging` and `prod` environments already exist for the project.
- Whether staging Trigger should share the current Supabase project with the staging API.
- Whether production Trigger deployment is only documented or also prepared with empty/unconfigured secrets.
- Who owns Trigger.dev account login and project access for CLI deployment.

## Blocker Recording Rule

If access is missing, record the command, sanitized error, expected account/project, and whether the blocker is auth, project membership, environment support, or missing secret ownership. Do not paste tokens or secret values.
