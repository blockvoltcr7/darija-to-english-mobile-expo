# Configuration Checklist

Create `artifacts/production-runtime-configuration-checklist.md` with names and statuses only.

| Area | Names To Verify | Surface | Status | Owner | Notes |
| --- | --- | --- | --- | --- | --- |
| Mobile public env | `EXPO_PUBLIC_API_BASE_URL`, `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | EAS production public env |  |  | No server secrets. |
| Clerk server | `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SIGNING_SECRET` | Cloud Run/worker secrets |  |  | Webhook route is `/v1/webhooks/clerk`. |
| Supabase | `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, buckets | Cloud Run/worker secrets |  |  | Confirm production project/buckets. |
| Trigger | `TRIGGER_PROJECT_REF`, `TRIGGER_SECRET_KEY`, `TRIGGER_ENVIRONMENT` | API and worker secrets |  |  | API and worker must match. |
| OpenAI | `OPENAI_API_KEY`, model env names, TTS env names | API/worker secrets |  |  | Confirm quota/spend owner. |
| Modal Darija ASR | `DARIJA_ASR_BASE_URL`, `DARIJA_ASR_URL`, `DARIJA_ASR_API_KEY`, timeout | API/worker secrets |  |  | Confirm endpoint ownership. |
| Upload/retention | `MAX_JSON_BODY_SIZE`, `AUDIO_UPLOAD_MAX_BYTES`, `AUDIO_RETENTION_DAYS` | API/worker direct env |  |  | Feed guardrails and privacy copy. |

Do not record values. Record only configured/not configured, owner, blocker, and verification method.
