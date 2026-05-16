# API Hosting Runbook

This runbook covers the separately deployed Node/Express API for the Darija to English Expo app. EAS builds the mobile app; Cloud Run hosts the API that owns server-only provider secrets.

## Staging Target

| Field | Value |
| --- | --- |
| Host | Google Cloud Run |
| Google Cloud project | `darija-to-english-expo` |
| Region | `us-central1` |
| Service | `darija-api-staging` |
| Runtime service account | `darija-api-staging-run@darija-to-english-expo.iam.gserviceaccount.com` |
| Artifact Registry repo | `darija-api` |
| Image | `us-central1-docker.pkg.dev/darija-to-english-expo/darija-api/darija-api-staging:latest` |
| Latest verified revision | `darija-api-staging-00001-dt9` |
| Staging API URL | `https://darija-api-staging-nwjxqrn2ra-uc.a.run.app` |

## Local GCP Setup

```bash
gcloud config set project darija-to-english-expo
gcloud config set run/region us-central1
gcloud auth application-default set-quota-project darija-to-english-expo
```

Required APIs for this staging path:

- Cloud Resource Manager
- Service Usage
- Cloud Run
- Cloud Build
- Artifact Registry
- Secret Manager

## Build And Deploy

Run from the repo root.

```bash
gcloud builds submit \
  --tag us-central1-docker.pkg.dev/darija-to-english-expo/darija-api/darija-api-staging:latest

gcloud run deploy darija-api-staging \
  --image us-central1-docker.pkg.dev/darija-to-english-expo/darija-api/darija-api-staging:latest \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 3 \
  --service-account darija-api-staging-run@darija-to-english-expo.iam.gserviceaccount.com \
  --set-env-vars NODE_ENV=production,HOST=0.0.0.0,TRIGGER_ENVIRONMENT=staging \
  --set-secrets CLERK_PUBLISHABLE_KEY=clerk-publishable-key:latest,CLERK_SECRET_KEY=clerk-secret-key:latest,SUPABASE_URL=supabase-url:latest,SUPABASE_SECRET_KEY=supabase-secret-key:latest,OPENAI_API_KEY=openai-api-key:latest,DARIJA_ASR_BASE_URL=darija-asr-base-url:latest,DARIJA_ASR_API_KEY=darija-asr-api-key:latest,TRIGGER_SECRET_KEY=trigger-secret-key:latest
```

The Dockerfile uses `npm ci --omit=dev --legacy-peer-deps` because plain `npm ci --omit=dev` fails against the current Expo/Clerk peer dependency graph in Cloud Build.

## Environment Variables

Cloud Run direct env vars:

- `NODE_ENV`
- `HOST`
- `TRIGGER_ENVIRONMENT`

Secret Manager-backed env vars:

- `CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `OPENAI_API_KEY`
- `DARIJA_ASR_BASE_URL`
- `DARIJA_ASR_API_KEY`
- `TRIGGER_SECRET_KEY`

Do not put these values in Expo public env, docs, screenshots, or command output. `SUPABASE_SERVICE_ROLE_KEY` exists locally as a legacy-compatible name, but the deployed API uses `SUPABASE_SECRET_KEY`, which is preferred by `server/env.mjs`.

To create or update the staging secrets from local `.env.local` without printing values:

```bash
node scripts/create-cloud-run-secrets.mjs
```

## Health Check

```bash
curl -sS https://darija-api-staging-nwjxqrn2ra-uc.a.run.app/health
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
    "openai_transcription": "gpt-4o-mini-transcribe",
    "consolidation": "gpt-5.5",
    "translation": "gpt-5.5"
  }
}
```

This endpoint verifies configuration shape only. It does not run paid translation, STT, or ASR calls.

## Logs

```bash
gcloud run services logs read darija-api-staging \
  --region us-central1 \
  --limit 50
```

Useful log events:

- startup line with API bind URL and configured dependency booleans
- `GET 200 /health`
- application health log with response shape and model metadata
- translation route logs during later E2E QA

Do not paste private request bodies, Clerk session tokens, audio contents, or secret values into docs.

## Service URL Lookup

```bash
gcloud run services describe darija-api-staging \
  --region us-central1 \
  --format 'value(status.url)'
```

## Rollback

List revisions:

```bash
gcloud run revisions list \
  --service darija-api-staging \
  --region us-central1
```

Route all traffic back to a previous revision:

```bash
gcloud run services update-traffic darija-api-staging \
  --region us-central1 \
  --to-revisions REVISION_NAME=100
```

Redeploying the last known-good image is also acceptable for staging:

```bash
gcloud run deploy darija-api-staging \
  --image us-central1-docker.pkg.dev/darija-to-english-expo/darija-api/darija-api-staging:latest \
  --region us-central1
```

## Known Constraints

- Cloud Run runs the existing Express API separately from Expo native builds.
- The service is public for staging reachability, but authenticated API routes still require Clerk bearer tokens.
- The current API accepts base64 JSON audio uploads and the server default body limit is `70mb`. Cloud Run has a lower documented HTTP/1 request-size limit, so large audio uploads remain a known E2E QA and production-readiness risk.
- Custom domains, Cloud Armor, Terraform, production service split, and direct-to-storage upload redesign are deferred.
