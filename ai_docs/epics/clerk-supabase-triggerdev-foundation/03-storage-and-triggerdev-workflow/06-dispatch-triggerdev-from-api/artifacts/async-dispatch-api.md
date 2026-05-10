# Async Dispatch API

Task: `dispatch-triggerdev-from-api`
Date: 2026-05-10

## Result

Added authenticated async submission route:

```http
POST /v1/translations
Authorization: Bearer <Clerk session token>
Content-Type: application/json
```

Request body:

```json
{
  "filename": "audio.m4a",
  "audio_base64": "<base64>"
}
```

Success response:

```json
{
  "jobId": "<translation job uuid>",
  "translationJobId": "<translation job uuid>",
  "status": "queued",
  "triggerRunId": "<trigger run id>",
  "createdAt": "<job created_at>",
  "detailUrl": "/v1/translations/<translation job uuid>"
}
```

## Flow

The route preserves the server-only ownership boundary:

1. Clerk auth runs before profile, DB, Storage, Trigger.dev, Modal, or OpenAI work.
2. Trigger runtime config is checked before DB/Storage work.
3. Server validates and decodes audio.
4. Server creates a queued `translation_jobs` row.
5. Server uploads original audio to private Supabase Storage.
6. Server writes storage metadata to the job.
7. Server dispatches Trigger.dev task `translate-audio-job` with payload `{ job_id }`.
8. Server stores `translation_jobs.trigger_run_id`.
9. Request returns `202` without running provider calls.

Trigger idempotency key:

```text
translation-job:<job_id>
```

## Failure Behavior

- Auth failure returns before DB, Storage, Trigger.dev, Modal, or OpenAI work.
- Storage metadata failure attempts Storage API object cleanup.
- Dispatch or trigger-run persistence failure marks the job `failed` with sanitized error fields.
- The existing synchronous `/v1/translate-audio` route remains available and working.

## Validation

Commands run:

```bash
node --check server/index.mjs
node --check trigger/translate-audio-job.mjs
npm run typecheck
npm run lint
```

Runtime authenticated dispatch still requires a valid `TRIGGER_SECRET_KEY` and a Trigger.dev worker/deployment for `translate-audio-job`.
