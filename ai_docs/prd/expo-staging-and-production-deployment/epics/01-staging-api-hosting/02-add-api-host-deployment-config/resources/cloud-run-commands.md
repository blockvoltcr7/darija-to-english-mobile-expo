# Cloud Run Deployment Commands

Run from the repo root.

```bash
gcloud config set project darija-to-english-expo
gcloud config set run/region us-central1

gcloud artifacts repositories create darija-api \
  --repository-format=docker \
  --location=us-central1 \
  --description="Darija API container images"

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

After deployment:

```bash
gcloud run services describe darija-api-staging \
  --region us-central1 \
  --format 'value(status.url)'
```
