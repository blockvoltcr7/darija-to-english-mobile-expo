# Trigger.dev Runbook Outline

Suggested sections for `ai_docs/deployment/triggerdev.md`.

## Runtime Shape

- Development worker path and why paid Staging/Preview environments are deferred.
- How API dispatch, Trigger task, Supabase Storage, and provider pipeline connect.

## Commands

- Local dev: `npx trigger.dev dev --config trigger.config.mjs --env-file .env.local`
- Development worker: `npm run trigger:dev -- --env-file .env.local --skip-update-check`
- Production path: `npm run trigger:deploy:prod`

## Environment Variables

- Name-only table of Trigger/API/worker env vars.
- Secret ownership and redaction rules.

## Verification

- Health check staging API.
- Submit authenticated development-runtime job.
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
- API and worker environment drift.
