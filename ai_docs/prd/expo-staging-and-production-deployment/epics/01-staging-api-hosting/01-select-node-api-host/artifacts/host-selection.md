# Host Selection

## Selected Host

Google Cloud Run is selected for the staging API.

## Target

- Google Cloud project: `darija-to-english-expo`
- Region: `us-central1`
- Service name for follow-up tasks: `darija-api-staging`
- API entrypoint: `npm run api`, which starts `server/index.mjs`

## Fit Check

| Requirement | Cloud Run fit |
| --- | --- |
| Node-compatible runtime | Supported through a container built from this repo. |
| Express or HTTP server support | Supported; the container listens on the Cloud Run-provided `PORT`. |
| HTTPS | Supported by the Cloud Run service URL. |
| Persistent env secrets | Supported through Secret Manager-backed env vars or direct Cloud Run env vars. |
| Logs and rollback | Supported through Cloud Run revisions and service logs. |
| Outbound provider access | Supported for Clerk, Supabase, Trigger.dev, Modal Darija ASR, and OpenAI. |
| Current base64 upload body | Risk: Cloud Run documents a 32 MiB maximum HTTP/1 request size. The current server allows `MAX_JSON_BODY_SIZE=70mb` and `AUDIO_UPLOAD_MAX_BYTES=50000000`, so large mobile uploads may need a future direct-to-storage upload path. |

## Decision Notes

Cloud Run is the lowest-risk staging choice because it runs the existing Express API as a long-lived HTTP container, keeps paid provider secrets server-side, gives us first-party HTTPS/logging/revision rollback, and matches the dedicated GCP project that has already been created for this app.

Vercel serverless/functions remain a poor fit for the current API shape unless request-size/runtime constraints are revalidated. Render, Fly.io, and Railway could work, but choosing them now would add another account/provider surface when the dedicated GCP project is already configured.

## Sources

- Local PRD: `ai_docs/prd/expo-staging-and-production-deployment/04-architecture-plan.md`
- Local API config: `server/env.mjs`
- Local API entrypoint: `server/index.mjs`
- Google Cloud Run container runtime contract: https://cloud.google.com/run/docs/container-contract
- Google Cloud Run quotas and limits: https://cloud.google.com/run/quotas
