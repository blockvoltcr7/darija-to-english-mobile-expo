# Development Runtime Job Evidence Template

Execution-time artifact. Fill after running a real job through the Development worker.

## Request

- API URL: `http://localhost:8787`
- Fixture name: `development-fixture.m4a`
- Approx audio duration: short clipped non-sensitive fixture
- Approx audio size: 24 KB / 24,426 bytes
- Clerk user: disposable Clerk test user, deleted after run
- Timestamp: `2026-05-15T18:40:43Z`
- Runtime context: local API from `npm run api`; local Trigger.dev Development worker from `npm run trigger:dev -- --env-file .env.local --skip-update-check`

## Queued Response

- HTTP status: `202`
- `status`: `queued`
- `jobId`: `365b4130-71b9-4cbc-9858-ab4e2a858313`
- `triggerRunId`: `run_cmp79j8xk9iy50ilm5ef4lv2t`
- `detailUrl`: `/v1/translations/365b4130-71b9-4cbc-9858-ab4e2a858313`

## Trigger Evidence

- Trigger project/environment: configured project, Development environment
- Task id: `translate-audio-job`
- Run id: `run_cmp79j8xk9iy50ilm5ef4lv2t`
- Started: `2026-05-15T18:40:43.493Z`
- Finished: `2026-05-15T18:41:27.786Z`
- Final run status: `succeeded`
- Worker evidence: same run ID claimed the stored job, downloaded 24,426 audio bytes, ran OpenAI STT, Modal Darija ASR, OpenAI consolidation, OpenAI translation, and finished successfully.

## API Polling Timeline

```text
2026-05-15T18:40:43Z queued
2026-05-15T18:40:49Z running
2026-05-15T18:41:27Z succeeded
```

## Result Visibility

- [x] English translation present
- [x] Consolidated Darija present
- [x] Raw OpenAI transcript present
- [x] Raw Darija transcript present
- [x] Model metadata present

## Cleanup

- Clerk session revoked.
- Disposable Clerk user deleted.
- Supabase translation rows/storage cleanup attempted after verification.

## Redaction Check

- [x] No Clerk session token
- [x] No API keys or service-role keys
- [x] No private audio contents
- [x] No full private transcript unless explicitly approved
