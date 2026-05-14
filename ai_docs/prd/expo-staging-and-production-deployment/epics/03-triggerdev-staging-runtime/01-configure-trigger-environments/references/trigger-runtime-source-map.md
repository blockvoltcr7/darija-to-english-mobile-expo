# Trigger Runtime Source Map

## PRD Anchors

- `ai_docs/prd/expo-staging-and-production-deployment/04-architecture-plan.md`: Trigger.dev is a separate deployable runtime between the hosted API and provider pipeline.
- `ai_docs/prd/expo-staging-and-production-deployment/05-technical-specifications.md`: deployed worker must claim stored jobs, download Supabase audio, run OpenAI STT and Modal ASR, consolidate, translate, and persist results.
- `ai_docs/prd/expo-staging-and-production-deployment/08-definition-of-done.md`: staging worker must be deployed and a Trigger run must succeed for uploaded audio before release readiness.

## Local Config Anchors

- `trigger.config.mjs`: reads `TRIGGER_PROJECT_REF` and defines `dirs: ['./trigger']`, retry defaults, and `maxDuration: 900`.
- `package.json`: defines `trigger:deploy:staging`, `trigger:deploy:prod`, and `trigger:dev`.
- `.env.example`: documents `TRIGGER_PROJECT_REF`, `TRIGGER_SECRET_KEY`, and `TRIGGER_ENVIRONMENT` without real values.
- `server/env.mjs`: exposes `TRIGGER_CONFIGURED` from `TRIGGER_SECRET_KEY` and defaults `TRIGGER_ENVIRONMENT` to `dev`.
- `ai_docs/deployment/api-hosting.md`: Cloud Run staging API sets `TRIGGER_ENVIRONMENT=staging` and receives `TRIGGER_SECRET_KEY` from Secret Manager.

## Runtime Anchors

- `server/index.mjs`: refuses async create requests unless Trigger is configured, dispatches `translateAudioJob.trigger`, and stores the returned run ID.
- `trigger/translate-audio-job.mjs`: task id is `translate-audio-job`; payload schema is `{ job_id: uuid }`.
- `server/translation-pipeline.mjs`: worker-side provider orchestration and job claim/download/persist flow.
