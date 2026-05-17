# Production API Path Runbook

Status: deferred decision gate. No production API URL is currently verified in this repository, and production mobile builds are no-go until `EXPO_PUBLIC_API_BASE_URL` has a chosen production HTTPS target.

This runbook documents the intended production path for the separately hosted Node/Express API. It does not create Cloud Run services, configure EAS production env, deploy Trigger.dev production, or mark production release-ready.

## Source Map

| Source | Production relevance |
| --- | --- |
| `ai_docs/deployment/api-hosting.md` | Current staging Cloud Run shape, deploy command pattern, health check, logs, rollback, and hosted-request-size caveat. |
| `ai_docs/deployment/triggerdev.md` | Current Trigger.dev Development worker path and future `npm run trigger:deploy:prod` command. |
| `server/env.mjs` | Server env validation, default model names, upload limits, bucket names, and forbidden public secret-name checks. |
| `server/index.mjs` | `/health`, `/health/supabase`, Clerk session requirement, authenticated translation routes, Trigger dispatch, and polling routes. |
| `trigger.config.mjs` | Trigger project selection through `TRIGGER_PROJECT_REF`, task directory, retry policy, and 900-second max duration. |
| `package.json` | API and Trigger scripts: `npm run api`, `npm run trigger:dev`, and `npm run trigger:deploy:prod`. |
| `eas.json` | Production build profile uses EAS `production` environment and `production` update channel. |
| `app.json` | App identity, EAS project ID, runtime version policy, and update URL. |

## Current Staging Baseline

The verified hosted staging API path is documented separately in `ai_docs/deployment/api-hosting.md`.

| Field | Current staging value |
| --- | --- |
| Host | Google Cloud Run |
| Google Cloud project | `darija-to-english-expo` |
| Region | `us-central1` |
| Service | `darija-api-staging` |
| Service account | `darija-api-staging-run@darija-to-english-expo.iam.gserviceaccount.com` |
| Artifact Registry repo | `darija-api` |
| Staging URL | `https://darija-api-staging-nwjxqrn2ra-uc.a.run.app` |

Do not silently reuse `darija-api-staging` for production. If a store beta temporarily targets this staging-backed API, label it as staging-backed and accept the shared-resource risks in writing before the build is submitted.

## Target Production Shape

Recommended target:

| Area | Target |
| --- | --- |
| Host | Google Cloud Run |
| Google Cloud project | Reuse `darija-to-english-expo` unless the owner creates a separate production GCP project. |
| Region | `us-central1` unless latency/compliance requirements change. |
| Service | `darija-api-production` |
| Runtime service account | `darija-api-production-run@darija-to-english-expo.iam.gserviceaccount.com` |
| Artifact Registry image | `us-central1-docker.pkg.dev/darija-to-english-expo/darija-api/darija-api-production:[IMAGE_TAG]` |
| Public reachability | Cloud Run public HTTPS URL for mobile clients; authenticated app routes still require Clerk bearer tokens. |
| Health URL pattern | `https://<production-cloud-run-url>/health` |
| Supabase smoke URL pattern | `https://<production-cloud-run-url>/health/supabase` |

The API must stay separate from the mobile binary. The app calls `EXPO_PUBLIC_API_BASE_URL`, and server-only secrets remain in Cloud Run, Trigger.dev, Supabase, Clerk, Modal, and OpenAI configuration.

## Production Readiness State

Production API deploy is deferred, not ready.

Reasons:

- No production Cloud Run service URL has been created and verified.
- Production Supabase, Clerk, Trigger.dev, Modal, and OpenAI isolation decisions are still human-owned.
- Trigger production deployment is deferred until production API secrets, storage, and task runtime are selected.
- Convex migration timing is undecided; moving persistence before production would change the backend contract and release plan.
- EAS production public env must not be configured until the production API HTTPS target is chosen.

## Required Env Var Names

List names only in docs, screenshots, and handoff notes. Never paste values.

Cloud Run direct env vars:

- `NODE_ENV`
- `HOST`
- `PORT`
- `MAX_JSON_BODY_SIZE`
- `TRIGGER_ENVIRONMENT`
- `AUDIO_UPLOAD_MAX_BYTES`
- `AUDIO_RETENTION_DAYS`

Secret Manager-backed API env vars:

- `CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SIGNING_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_AUDIO_ORIGINALS_BUCKET`
- `SUPABASE_TRANSLATION_ARTIFACTS_BUCKET`
- `OPENAI_API_KEY`
- `OPENAI_TRANSCRIPTION_MODEL`
- `OPENAI_CONSOLIDATION_MODEL`
- `OPENAI_TRANSLATION_MODEL`
- `CONSOLIDATION_MODEL`
- `TRANSLATION_MODEL`
- `DARIJA_ASR_BASE_URL`
- `DARIJA_ASR_URL`
- `DARIJA_ASR_API_KEY`
- `DARIJA_ASR_TIMEOUT_MS`
- `TRIGGER_PROJECT_REF`
- `TRIGGER_SECRET_KEY`

Mobile-safe EAS public env names:

- `EXPO_PUBLIC_API_BASE_URL`
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`

`server/env.mjs` rejects public Expo env names that look like Supabase or Trigger secrets. Keep service-role keys, Trigger keys, OpenAI keys, Modal keys, and Clerk secret keys out of EAS public env.

## Human Decisions And Pause Points

| Area | Current decision | Owner | Blocker or pause point |
| --- | --- | --- | --- |
| Cloud Run service isolation | Production deploy deferred; recommended separate `darija-api-production` service. | Human infrastructure owner | Stop before creating service, IAM, Artifact Registry tags, or production secrets. |
| Supabase isolation | Undecided; prefer separate production project or explicitly separated production buckets/tables with RLS review. | Human data owner | Stop before pointing production API at any Supabase project. Current `server/db.mjs` exposes a hardcoded project-ref label in health output that must match the chosen project before claiming production readiness. |
| Clerk isolation | Undecided; prefer production Clerk instance/keys and production webhook signing secret. | Human auth owner | Stop before configuring production Clerk keys, webhooks, or EAS production publishable key. |
| Trigger.dev production | Deferred; production command shape is `npm run trigger:deploy:prod`. | Human runtime owner | Stop before deploying Trigger production or setting production `TRIGGER_SECRET_KEY`. API and worker must share the same `TRIGGER_PROJECT_REF` and environment. |
| Modal Darija ASR | Undecided; choose same endpoint with accepted risk or a production endpoint/version. | Human provider owner | Stop before treating a staging/test Modal endpoint as production. |
| OpenAI isolation | Undecided; choose production key/project and spend owner. | Human provider owner | Stop before using a shared personal/test OpenAI key for production traffic. |
| Convex timing | Undecided; current runbook assumes existing Express + Supabase path. | Product/engineering owner | If Convex migration happens first, rewrite this runbook around the new persistence and API contract before production release. |
| Store beta against staging-backed API | Not approved by this doc; allowed only as a labeled beta exception with accepted shared-resource risks. | Release owner | Stop before submitting a beta build that points `EXPO_PUBLIC_API_BASE_URL` at staging without explicit approval. |
| EAS production public env | Deferred until production API URL exists. | Release owner | Stop before setting `EXPO_PUBLIC_API_BASE_URL` for EAS production. |

## Deploy Command Shape

Run from the repo root after the human decisions above are made.

```bash
gcloud config set project darija-to-english-expo
gcloud config set run/region us-central1
gcloud auth application-default set-quota-project darija-to-english-expo

gcloud builds submit \
  --tag us-central1-docker.pkg.dev/darija-to-english-expo/darija-api/darija-api-production:[IMAGE_TAG]

gcloud run deploy darija-api-production \
  --image us-central1-docker.pkg.dev/darija-to-english-expo/darija-api/darija-api-production:[IMAGE_TAG] \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --timeout 300 \
  --max-instances [MAX_INSTANCES] \
  --service-account darija-api-production-run@darija-to-english-expo.iam.gserviceaccount.com \
  --set-env-vars NODE_ENV=production,HOST=0.0.0.0,TRIGGER_ENVIRONMENT=prod \
  --set-secrets CLERK_PUBLISHABLE_KEY=[SECRET_NAME]:latest,CLERK_SECRET_KEY=[SECRET_NAME]:latest,CLERK_WEBHOOK_SIGNING_SECRET=[SECRET_NAME]:latest,SUPABASE_URL=[SECRET_NAME]:latest,SUPABASE_SECRET_KEY=[SECRET_NAME]:latest,OPENAI_API_KEY=[SECRET_NAME]:latest,DARIJA_ASR_BASE_URL=[SECRET_NAME]:latest,DARIJA_ASR_API_KEY=[SECRET_NAME]:latest,TRIGGER_SECRET_KEY=[SECRET_NAME]:latest
```

`PORT` is injected by Cloud Run. Use `HOST=0.0.0.0` so the Express process binds correctly inside the container.

## Trigger Production Dependency

Production translation jobs are not ready until the Trigger task is deployed to the production runtime and the API dispatch key points at that same runtime.

```bash
npm run trigger:deploy:prod
```

Verify that:

- `trigger.config.mjs` resolves the intended `TRIGGER_PROJECT_REF`.
- API `TRIGGER_SECRET_KEY` belongs to the chosen production environment.
- API `TRIGGER_ENVIRONMENT` matches the production Trigger runtime expectation.
- Task id `translate-audio-job` is deployed.
- A production test job returns a `triggerRunId` and the worker processes the stored job to a terminal status.

## Health Checks

Lookup production URL:

```bash
PRODUCTION_API_URL="$(gcloud run services describe darija-api-production \
  --region us-central1 \
  --format 'value(status.url)')"
```

Configuration health:

```bash
curl -sS "$PRODUCTION_API_URL/health"
```

Expected shape:

```json
{
  "ok": true,
  "service": "darija-to-english-api",
  "dependencies": {
    "clerk": true,
    "darija_asr": true,
    "openai": true,
    "supabase": true
  },
  "models": {
    "openai_transcription": "MODEL_NAME",
    "consolidation": "MODEL_NAME",
    "translation": "MODEL_NAME"
  }
}
```

Supabase smoke check:

```bash
curl -sS "$PRODUCTION_API_URL/health/supabase"
```

The `/health` endpoint checks configuration shape only. It does not run paid STT, ASR, consolidation, or translation calls.

## Logs

```bash
gcloud run services logs read darija-api-production \
  --region us-central1 \
  --limit 50
```

Useful production log events:

- startup line with API bind URL and configured dependency booleans
- `GET 200 /health`
- `GET 200 /health/supabase` after Supabase choice is made
- authenticated `POST /v1/translations` accepted with queued job ID
- Trigger dispatch returning a run ID
- polling route returning terminal `succeeded` or `failed` status

Do not paste request bodies, Clerk session tokens, secret values, private audio contents, or full private transcripts into docs or issue comments.

## Rollback

Cloud Run revision rollback:

```bash
gcloud run revisions list \
  --service darija-api-production \
  --region us-central1

gcloud run services update-traffic darija-api-production \
  --region us-central1 \
  --to-revisions [REVISION_NAME]=100
```

Production rollback must also consider:

- Trigger task version and environment.
- EAS Update `production` channel if JavaScript changes are involved.
- Store build limitations if a binary with the wrong API URL has shipped.
- Supabase schema/storage migrations and whether rollback is backward-compatible.
- Clerk webhook endpoint changes.
- Modal/OpenAI provider version or key rotation changes.

## Shared-Resource Risks

| Resource | Risk if shared with staging | Mitigation before production |
| --- | --- | --- |
| Cloud Run service | Staging deploys, env edits, and rollback can affect store users. | Use separate `darija-api-production` service and service account. |
| Secret Manager | Secret rotation for staging can break production or expose production values to test logs. | Use production-specific secret names and IAM. |
| Supabase | Test jobs can pollute user history, storage, and provider-run records. | Prefer separate production project; otherwise document table/bucket separation and RLS review. |
| Clerk | Test users, sessions, and webhooks can mix with production users. | Use production Clerk keys and webhook endpoint. |
| Trigger.dev | Jobs can stay queued or run on the wrong worker/runtime. | Deploy production task and verify API dispatch against the same runtime. |
| Modal Darija ASR | Test traffic, model changes, and quota/cost may affect production. | Pin production endpoint/version or accept documented shared endpoint risk. |
| OpenAI | Shared spend/quota makes incidents and billing harder to diagnose. | Use a production-owned key/project and monitor usage. |
| EAS production env | Production binary can compile with staging or local API target. | Set `EXPO_PUBLIC_API_BASE_URL` only after production HTTPS URL is verified. |

## Release Gate

Production mobile release remains blocked until all of these are true:

- Production HTTPS API URL is chosen.
- `EXPO_PUBLIC_API_BASE_URL` for EAS production points to that URL.
- `/health` returns the expected shape from the production service.
- `/health/supabase` returns healthy for the chosen production data store.
- Trigger production task deployment is verified.
- Clerk production auth and webhook behavior is verified.
- At least one authenticated production-path test job reaches terminal status without leaking private audio, transcript, token, or secret data.

Store beta may temporarily target the staging-backed API only as a documented exception, with the release owner accepting shared-resource risk and user/data isolation limits before submission.
