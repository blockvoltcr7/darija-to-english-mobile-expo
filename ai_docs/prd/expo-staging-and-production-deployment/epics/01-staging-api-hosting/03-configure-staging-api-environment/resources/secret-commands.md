# Secret Configuration Commands

Run from the repo root. Commands use local `.env.local` values without printing them.

```bash
node scripts/create-cloud-run-secrets.mjs
```

The script creates or updates these Secret Manager secrets:

- `clerk-publishable-key`
- `clerk-secret-key`
- `supabase-url`
- `supabase-secret-key`
- `openai-api-key`
- `darija-asr-base-url`
- `darija-asr-api-key`
- `trigger-secret-key`

The Cloud Run runtime service account for staging is:

```bash
darija-api-staging-run@darija-to-english-expo.iam.gserviceaccount.com
```

It needs Secret Manager access:

```bash
gcloud projects add-iam-policy-binding darija-to-english-expo \
  --member='serviceAccount:darija-api-staging-run@darija-to-english-expo.iam.gserviceaccount.com' \
  --role='roles/secretmanager.secretAccessor' \
  --condition=None
```

After deployment, confirm the service env binding without printing values:

```bash
gcloud run services describe darija-api-staging \
  --region us-central1 \
  --format='json(spec.template.spec.containers[0].env)'
```
