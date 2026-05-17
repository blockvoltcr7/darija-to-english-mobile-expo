# Production API Source Map

Use these sources when enriching the production API path. This task can document a deferred production deploy; do not imply production is live until a production Cloud Run service URL and Trigger production deployment are verified.

## Local Sources

| Source | Relevant contract |
| --- | --- |
| `ai_docs/deployment/api-hosting.md` | Current Cloud Run staging runbook, staging URL, deploy command, env names, health check, logs, rollback, and request-size caveat. |
| `ai_docs/deployment/triggerdev.md` | Current Trigger.dev Development runtime, future production deploy command, env names, correlation IDs, and production deferral. |
| `server/env.mjs` | Server env contract, default `TRIGGER_ENVIRONMENT=dev`, secret-boundary checks for public Supabase/Trigger secret names, upload limits, model env names, and bucket names. |
| `server/index.mjs` | `/health`, authenticated translation routes, Clerk session requirement, Trigger dispatch gate, and response shape. |
| `trigger.config.mjs` | Trigger project reference, task directory, retry config, and max duration. |
| `trigger/translate-audio-job.mjs` | Stable Trigger task id `translate-audio-job`, payload schema, retry attempts, and 900-second task max duration. |

## Provider References

| Provider doc | Why it matters |
| --- | --- |
| Google Cloud Run quotas and limits: https://cloud.google.com/run/quotas | Confirms hosted request-size constraints that affect the current base64 JSON audio upload design. |
| Google Cloud Run environment variables: https://cloud.google.com/run/docs/configuring/services/environment-variables | Confirms Cloud Run env vars are revision-scoped and that `PORT` is injected by Cloud Run. |
| Google Cloud Run deploy command: https://cloud.google.com/sdk/gcloud/reference/run/deploy | Confirms `gcloud run deploy` supports `--set-env-vars`, `--set-secrets`, traffic, service account, timeout, memory, CPU, and unauthenticated/public settings. |
| Trigger.dev deployment overview: https://trigger.dev/docs/deployment/overview | Confirms the Trigger production task deployment path and environment variable management expectations. |

## Current Gap To Carry Into Task Docs

- Staging Cloud Run docs currently set `TRIGGER_ENVIRONMENT=staging`, while the verified no-paid Trigger path uses the Development runtime. Production docs should make the runtime decision explicit instead of inheriting staging by copy/paste.
- Production must choose whether to share the existing GCP project, Supabase project/buckets, Clerk instance, Trigger project/environment, Modal endpoint, and OpenAI account with staging.
- Production EAS public values must stay pending until the production API URL decision is made.
