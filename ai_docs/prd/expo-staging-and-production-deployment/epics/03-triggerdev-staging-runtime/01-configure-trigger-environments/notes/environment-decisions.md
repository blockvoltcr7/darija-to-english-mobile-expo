# Environment Decisions

## Current Defaults

- Trigger project fallback in `trigger.config.mjs`: `proj_tehveeweadzwantwpvpr`.
- API staging host: Google Cloud Run service `darija-api-staging`.
- API staging URL: `https://darija-api-staging-nwjxqrn2ra-uc.a.run.app`.
- Development scope uses `TRIGGER_ENVIRONMENT=dev`.

## Decisions To Confirm During Execution

- Whether the API path used for QA dispatches to the same Trigger.dev Development environment as the local worker.
- Whether development runtime should share the current Supabase project with the hosted API.
- Whether production Trigger deployment is only documented or also prepared with empty/unconfigured secrets.
- Who owns Trigger.dev account login and project access for CLI deployment.

## Deferred Paid Scope

Trigger.dev Staging and Preview environments require an account upgrade. Do not require them for this epic.

## Blocker Recording Rule

If access is missing, record the command, sanitized error, expected account/project, and whether the blocker is auth, project membership, environment support, or missing secret ownership. Do not paste tokens or secret values.
