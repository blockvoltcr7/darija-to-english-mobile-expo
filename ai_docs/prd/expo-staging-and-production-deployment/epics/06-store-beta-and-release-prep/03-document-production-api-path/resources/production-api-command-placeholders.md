# Production API Command Placeholders

These are placeholders for the production runbook. Replace bracketed values only after the production service, secrets, and Trigger runtime are intentionally chosen. Do not paste secret values into docs or terminal evidence.

## GCP Context

```bash
gcloud config set project darija-to-english-expo
gcloud config set run/region us-central1
gcloud auth application-default set-quota-project darija-to-english-expo
```

## Build Image

```bash
gcloud builds submit \
  --tag us-central1-docker.pkg.dev/darija-to-english-expo/darija-api/darija-api-production:[IMAGE_TAG]
```

## Deploy Production API

```bash
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
  --set-secrets CLERK_PUBLISHABLE_KEY=clerk-publishable-key-production:latest,CLERK_SECRET_KEY=clerk-secret-key-production:latest,SUPABASE_URL=supabase-url-production:latest,SUPABASE_SECRET_KEY=supabase-secret-key-production:latest,OPENAI_API_KEY=openai-api-key-production:latest,DARIJA_ASR_BASE_URL=darija-asr-base-url-production:latest,DARIJA_ASR_API_KEY=darija-asr-api-key-production:latest,TRIGGER_SECRET_KEY=trigger-secret-key-production:latest
```

## Health Check

```bash
PRODUCTION_API_URL="$(gcloud run services describe darija-api-production \
  --region us-central1 \
  --format 'value(status.url)')"

curl -sS "$PRODUCTION_API_URL/health"
```

Expected response shape:

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

## Logs

```bash
gcloud run services logs read darija-api-production \
  --region us-central1 \
  --limit 50
```

## Trigger Production Deploy

```bash
npm run trigger:deploy:prod
```

This is a dependency for production translation jobs. Do not mark production API ready for mobile release until the API dispatch secret, Trigger environment, and deployed task version are verified against the same production runtime.

## Rollback

```bash
gcloud run revisions list \
  --service darija-api-production \
  --region us-central1

gcloud run services update-traffic darija-api-production \
  --region us-central1 \
  --to-revisions [REVISION_NAME]=100
```

If the mobile production build has already shipped with a production API URL, rollback must coordinate API revision, Trigger task version, EAS Update channel, and any store build rollback limits.
