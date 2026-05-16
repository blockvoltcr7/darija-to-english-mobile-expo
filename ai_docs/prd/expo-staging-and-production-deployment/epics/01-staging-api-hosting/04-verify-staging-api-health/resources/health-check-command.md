# Health Check Command

```bash
curl -sS https://darija-api-staging-nwjxqrn2ra-uc.a.run.app/health
```

Cloud Run logs:

```bash
gcloud run services logs read darija-api-staging \
  --region us-central1 \
  --limit 50
```
