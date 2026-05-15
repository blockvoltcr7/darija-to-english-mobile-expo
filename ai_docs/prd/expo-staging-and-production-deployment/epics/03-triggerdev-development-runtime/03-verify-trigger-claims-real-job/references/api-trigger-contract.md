# API And Trigger Contract

## Create Translation

`server/index.mjs` exposes authenticated `POST /v1/translations`.

Request shape:

```json
{
  "filename": "audio.m4a",
  "audio_base64": "<base64 audio>"
}
```

Queued response must include:

- `jobId`
- `translationJobId`
- `status: queued`
- `triggerRunId`
- `detailUrl`

## Dispatch

`server/index.mjs` calls:

```text
translateAudioJob.trigger({ job_id: jobId }, { idempotencyKey, tags })
```

The returned run id is stored on the translation job through `updateTranslationJobTriggerRunId`.

## Worker

`trigger/translate-audio-job.mjs` task id:

```text
translate-audio-job
```

Payload schema:

```json
{
  "job_id": "<uuid>"
}
```

The worker calls `processStoredTranslationJob` in `server/translation-pipeline.mjs`.

## Polling

`GET /v1/translations/:id` returns the persisted job, provider runs, result fields, model metadata, and `triggerRunId`. `lib/api.ts` preserves `triggerRunId` through client diagnostics.
