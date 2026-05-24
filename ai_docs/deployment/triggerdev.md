# Trigger.dev Operations Runbook

This runbook covers the Trigger.dev worker for async translation jobs in the Darija to English Expo app. The current verified QA path uses Trigger.dev's included Development environment and a local worker process. Paid Trigger.dev Staging and Preview environments are deferred.

## Runtime Shape

The mobile app sends authenticated translation requests to the API. The API stores the original audio in private Supabase Storage, creates a translation job row, dispatches `translate-audio-job`, saves the Trigger run ID, and returns a queued response. The local Trigger.dev Development worker claims the stored job, downloads the private audio, runs OpenAI STT and Modal Darija ASR in parallel, consolidates with OpenAI, translates with OpenAI, persists the result, and marks the job `succeeded` or `failed`.

Source files:

| File | Ownership |
| --- | --- |
| `trigger.config.mjs` | Trigger project, task directory, retries, and max duration. |
| `trigger/translate-audio-job.mjs` | Stable task id `translate-audio-job`; logs run ID, job ID, and attempt; calls the stored-job pipeline. |
| `server/index.mjs` | Authenticated `/v1/translations` dispatch, queued response, `/health`, and polling routes. |
| `server/translation-pipeline.mjs` | Stored-job claim, storage download, provider calls, consolidation, translation, and final status update. |
| `server/translations.mjs` | Translation job persistence, `trigger_run_id`, provider runs, and result mapping. |
| `lib/api.ts` | Mobile client submission, polling, token refresh, and diagnostics. |
| `app/translate.tsx` | Upload/recording UI diagnostics and trace ID creation. |

## Environments

Use Development for this epic because the account includes it without an upgrade. Trigger.dev Staging and Preview require a paid plan, so they are not part of the current QA scope.

| Environment | Current use |
| --- | --- |
| Development | Verified local worker path for development-runtime QA. |
| Staging | Deferred until the account is upgraded or the team chooses a different staging strategy. |
| Preview | Deferred until the account is upgraded. |
| Production | Future release path; do not deploy until production API URL and production secrets are ready. |

The verified Task 03 run used local API `http://localhost:8787` with a local Development worker. `ai_docs/deployment/api-hosting.md` still documents the Cloud Run staging API target; do not assume that hosted API is wired to this no-paid Trigger Development path until its Trigger environment is explicitly updated and verified.

## Commands

Run from the repo root.

```bash
ENABLE_TTS=true npm run api
ENABLE_TTS=true npm run trigger:dev -- --env-file .env.local --skip-update-check
```

Direct equivalent:

```bash
ENABLE_TTS=true npx trigger dev --config trigger.config.mjs --env-file .env.local --skip-update-check
```

Future production deploy command:

```bash
npm run trigger:deploy:prod
```

Treat production deployment as deferred until production API hosting, production Trigger secrets, production Supabase storage, and release-readiness QA are all decided.

## Environment Variables

List variable names only in docs and screenshots. Never paste values.

| Area | Variable names |
| --- | --- |
| Trigger | `TRIGGER_PROJECT_REF`, `TRIGGER_SECRET_KEY`, `TRIGGER_ENVIRONMENT` |
| API process | `HOST`, `PORT`, `MAX_JSON_BODY_SIZE`, `NODE_ENV` |
| Clerk | `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SIGNING_SECRET` |
| Supabase | `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_AUDIO_ORIGINALS_BUCKET`, `SUPABASE_TRANSLATION_ARTIFACTS_BUCKET` |
| Providers | `OPENAI_API_KEY`, `DARIJA_ASR_BASE_URL`, `DARIJA_ASR_URL`, `DARIJA_ASR_API_KEY`, `DARIJA_ASR_TIMEOUT_MS` |
| Models | `OPENAI_TRANSCRIPTION_MODEL`, `OPENAI_CONSOLIDATION_MODEL`, `OPENAI_TRANSLATION_MODEL`, `CONSOLIDATION_MODEL`, `TRANSLATION_MODEL` |
| Upload and retention | `AUDIO_UPLOAD_MAX_BYTES`, `AUDIO_RETENTION_DAYS` |

The API rejects public Expo env names that look like Supabase or Trigger secrets. Mobile-safe public env belongs in `EXPO_PUBLIC_*` only when it is intentionally public, such as the API base URL or Clerk publishable key.

## Verification

1. Start the local API and Trigger Development worker.
2. Confirm API configuration shape:

```bash
curl -sS http://localhost:8787/health
```

Expected response includes `models.openai_transcription`, `models.consolidation`, and `models.translation`.

3. Submit an authenticated `POST /v1/translations` request with `{ filename, audio_base64 }`.
4. Confirm the queued API response includes `202`, `status: queued`, `jobId`, `translationJobId`, `triggerRunId`, and `detailUrl`.
5. Poll `GET /v1/translations/:id` with a refreshed Clerk session token until the job reaches `succeeded` or `failed`.
6. Confirm Trigger logs for the same run ID show task start, stored-job claim, private audio download, OpenAI STT completion, Modal Darija ASR completion, consolidation, translation, and final status.

Verified development-runtime evidence for the 2026-05-15 run is stored in the Task 03 artifact, not repeated here as a generic example.

## Correlation

Use these identifiers to connect mobile diagnostics, API logs, database rows, and Trigger runs:

| Identifier | Where it appears |
| --- | --- |
| `traceId` | Mobile diagnostics and API logs through `X-Trace-Id`. Useful for one user action. |
| `jobId` | API queued response, `translation_jobs.id`, polling URL, Trigger task payload `job_id`, and API logs. |
| `translationJobId` | API/mobile alias for the same translation job ID. |
| `triggerRunId` | API queued response, `translation_jobs.trigger_run_id`, mobile polling diagnostics, and Trigger dashboard run. |

For a support note, capture the `traceId`, `jobId`, `triggerRunId`, terminal status, timestamps, and whether each result field is present. Do not include Clerk session tokens, secret values, audio contents, or full transcripts.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Job stays `queued` | Confirm `ENABLE_TTS=true npm run trigger:dev -- --env-file .env.local --skip-update-check` is running and connected to the same Trigger project/environment as the API. |
| Queued response has no `triggerRunId` | Check API logs for Trigger dispatch failure; `server/index.mjs` treats missing run ID as a `502`. |
| Worker does not claim job | Check `translation_jobs.status`, idempotency key `translation-job:<jobId>`, and whether another worker already moved the job to `running` or `succeeded`. |
| Already-running or already-succeeded job | `server/translation-pipeline.mjs` returns skipped state for jobs that are no longer claimable because they are already running or complete. |
| Supabase storage failure | Check that storage metadata exists on the job row and that the worker can read the private original-audio object. |
| Provider failure | Use worker logs to identify OpenAI transcription, Modal Darija ASR, OpenAI consolidation, or OpenAI translation. Record the owner and sanitized error before re-running paid calls. |
| Auth failure | Confirm the mobile/API request sends `Authorization: Bearer <Clerk session token>` and that polling refreshes the Clerk token. Never paste the token into logs or docs. |
| API/worker drift | Confirm both API and worker load compatible `.env.local` values, especially `TRIGGER_PROJECT_REF`, `TRIGGER_SECRET_KEY`, `TRIGGER_ENVIRONMENT`, Supabase credentials, and provider settings. |
| Body-size failure | Check current base64 JSON upload size against `AUDIO_UPLOAD_MAX_BYTES`, `MAX_JSON_BODY_SIZE`, and hosted API request-size limits. |

## Redaction Rules

Allowed evidence:

- API URL, command shape, status values, job ID, Trigger run ID, trace ID, timestamps, model names, and result-field presence.

Disallowed evidence:

- Clerk session tokens, API keys, service-role keys, private audio contents, full private transcripts, provider request bodies, and raw `.env` output.
