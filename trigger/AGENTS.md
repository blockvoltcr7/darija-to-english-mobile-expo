# AGENTS.md

## Scope

Trigger.dev task definitions for background translation jobs.

## Files

| Path | Purpose |
| --- | --- |
| `translate-audio-job.mjs` | Claims a stored translation job and runs the server-side provider pipeline. |
| `response-audio-job.mjs` | Claims a stored response-audio job and generates Moroccan Darija reply audio. |

## Rules

- Keep Trigger tasks thin; provider orchestration should stay in `server/translation-pipeline.mjs`.
- Always log `jobId`, Trigger `runId`, and attempt number at task start.
- Do not log secrets, Clerk session tokens, or full transcripts.
- Treat missing stored jobs, already-running jobs, and already-succeeded jobs as explicit states, not silent successes.
- Keep task identifiers stable because queued API responses and QA docs reference them.

## Local Development

```bash
npx trigger.dev dev --env-file .env.local
```

The API and worker must both be running for simulator upload QA:

```bash
npm run api
npx trigger.dev dev --env-file .env.local
```

## Verification

```bash
node --check trigger/translate-audio-job.mjs
node --check trigger/response-audio-job.mjs
```

For E2E QA, verify the Trigger run reaches `Success` and its logs include stored-job claim, audio download, provider completion, consolidation, translation, and final `succeeded` status.
