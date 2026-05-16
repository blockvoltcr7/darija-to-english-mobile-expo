# Environment Decisions

## Current Defaults

- Trigger project fallback in `trigger.config.mjs`: `proj_tehveeweadzwantwpvpr`.
- API staging host: Google Cloud Run service `darija-api-staging`.
- API staging URL: `https://darija-api-staging-nwjxqrn2ra-uc.a.run.app`.
- Development scope uses `TRIGGER_ENVIRONMENT=dev`.

## Decisions To Confirm During Execution

- API path for this epic: local API at `http://localhost:8787`, loaded from `.env.local`.
- Trigger worker path for this epic: local `trigger.dev dev` process using `.env.local`.
- Rationale: the hosted Cloud Run API runbook still documents `TRIGGER_ENVIRONMENT=staging`, so it is not the clean Development-environment match for this no-paid Trigger scope.
- Supabase resources: local API and local worker share the Supabase project configured in `.env.local`.
- Production Trigger deployment: documented as a future release path only; do not run it in this epic.
- Trigger.dev account login/project access: verified in Phase 2 by the local worker command, not by printing account details here.

## Deferred Paid Scope

Trigger.dev Staging and Preview environments require an account upgrade. Do not require them for this epic.

## Blocker Recording Rule

If access is missing, record the command, sanitized error, expected account/project, and whether the blocker is auth, project membership, environment support, or missing secret ownership. Do not paste tokens or secret values.
