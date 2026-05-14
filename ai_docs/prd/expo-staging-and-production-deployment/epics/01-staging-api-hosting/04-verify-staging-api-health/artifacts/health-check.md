# Health Check Evidence

## Service

- Service: `darija-api-staging`
- Region: `us-central1`
- Latest ready revision: `darija-api-staging-00001-dt9`
- Traffic: `100%`
- Service URL: `https://darija-api-staging-nwjxqrn2ra-uc.a.run.app`

The deployment command also returned a project-number URL, which successfully served `/health`:

```text
https://darija-api-staging-854150397992.us-central1.run.app
```

## Command

```bash
curl -sS https://darija-api-staging-nwjxqrn2ra-uc.a.run.app/health
```

## Sanitized Response

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

## Sanitized Log Evidence

```text
GET 200 /health
Health check responseShape=["ok","service","dependencies","models"]
models.openai_transcription=gpt-4o-mini-transcribe
models.consolidation=gpt-5.5
models.translation=gpt-5.5
clerkConfigured=true
supabaseConfigured=true
```

No paid translation/STT call was run for this verification.
