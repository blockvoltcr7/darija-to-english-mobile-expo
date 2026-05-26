# Deploy Production Cloud Run API

## Type

Infrastructure

## Context

PRD Phase 3 requires a production HTTPS API before public App Review. The current verified hosted API is `darija-api-staging`; `ai_docs/deployment/production-api.md` explicitly marks production API deployment as deferred and says production mobile builds are no-go until a production `EXPO_PUBLIC_API_BASE_URL` exists.

## Implementation

- Update `ai_docs/deployment/production-api.md` during execution with the chosen production Cloud Run service, image tag, region, service account, direct env names, secret names, revision, rollback target, and verified URL.
- Follow the staging command shape in `ai_docs/deployment/api-hosting.md`, but deploy `darija-api-production` and set `TRIGGER_ENVIRONMENT=prod` only after Task 01 decisions are recorded.
- Verify `server/index.mjs` `/health` and `/health/supabase`; record only safe response shape, model names, service URL, revision, and timestamps in `artifacts/production-api-deployment-summary.md`.
- Do not configure EAS production public env until the production URL passes health checks.

## Acceptance Criteria

- [ ] `darija-api-production` or the approved equivalent has a stable HTTPS URL.
- [ ] `/health` returns `ok: true`, dependency booleans, and `models.openai_transcription`, `models.consolidation`, and `models.translation` without secrets.
- [ ] `/health/supabase` is checked when production Supabase is configured, and any failure is recorded as a blocker rather than hidden.
- [ ] Deployment notes distinguish Cloud Run direct env vars, Secret Manager-backed vars, and EAS public env vars.
- [ ] Rollback command or previous revision strategy is documented without private account values.

## Dependencies

- Depends On: `decide-production-resource-isolation`
- Blocks: `deploy-production-trigger-worker`
- Blocks: `configure-production-auth-storage-and-providers`

## Technical Notes

- `server/index.mjs` owns `/health`, `/health/supabase`, Clerk-authenticated translation routes, and Trigger dispatch.
- `server/env.mjs` validates upload limits, provider model names, Supabase secrets, Clerk config, Trigger config, and forbidden public secret names.
- `scripts/create-cloud-run-secrets.mjs` exists for staging secret creation; adapt only if it supports the approved production naming path without printing values.
- Cloud Run public reachability is acceptable for the API host because app routes still require Clerk bearer tokens.

## Artifact Slots

- `artifacts/production-api-deployment-summary.md`: sanitized URL, revision, health shape, rollback target, and blockers.
- `references/source-anchors.md`: local deployment and API-code anchors.
- `resources/production-api-checklist.md`: deploy, health, log, and rollback checklist.
- `notes/cloud-run-blockers.md`: IAM, account, quota, or service-name blockers.
