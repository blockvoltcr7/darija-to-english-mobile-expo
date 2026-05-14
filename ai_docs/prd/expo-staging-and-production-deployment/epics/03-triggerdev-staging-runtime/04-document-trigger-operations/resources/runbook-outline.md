# Trigger.dev Runbook Outline

Suggested sections for `ai_docs/deployment/triggerdev.md`.

## Runtime Shape

- Local dev worker versus deployed staging worker.
- How API dispatch, Trigger task, Supabase Storage, and provider pipeline connect.

## Commands

- Local dev: `npx trigger.dev dev --config trigger.config.mjs --env-file .env.local`
- Staging deploy: `npm run trigger:deploy:staging`
- Production path: `npm run trigger:deploy:prod`

## Environment Variables

- Name-only table of Trigger/API/worker env vars.
- Secret ownership and redaction rules.

## Verification

- Health check staging API.
- Submit authenticated staging job.
- Poll API status.
- Inspect Trigger run logs.

## Correlation

- `jobId`
- `translationJobId`
- `triggerRunId`
- `traceId`

## Troubleshooting

- Job stays `queued`.
- Missing Trigger run ID.
- Worker cannot claim job.
- Provider call failure.
- Supabase storage/result write failure.
- Auth/token failure.
- Staging API and worker environment drift.
