# Server Storage Flow

Task: `add-server-side-audio-storage-flow`
Date: 2026-05-10

## Result

Added `server/storage.mjs` as the server-only Storage boundary.

The helper supports:

- base64 normalization and validation
- MIME/extension normalization for audio uploads
- max-size enforcement before provider or Trigger.dev work
- server-side upload to `audio-originals`
- private object key construction under the Clerk user/job path
- Storage API download helper for the future worker task
- Storage API remove helper for cleanup

## Runtime Integration

`POST /v1/translate-audio` keeps the existing synchronous response shape, but now performs the server-side storage step before provider calls:

1. Verify Clerk session.
2. Resolve app profile.
3. Validate `{ filename, audio_base64 }`.
4. Decode and validate audio on the server.
5. Create `translation_jobs` row.
6. Upload original audio to private Supabase Storage.
7. Write `audio_bucket`, `audio_object_key`, `audio_size_bytes`, `audio_mime_type`, and `audio_retention_expires_at` to the job.
8. Mark the job `running`.
9. Execute existing OpenAI/Modal provider flow.

If the DB metadata write fails after upload, the route attempts Storage API removal for the uploaded object before surfacing the error. Cleanup uses the Supabase Storage API, not SQL deletes.

## Server-Only Env Boundary

Added backend-only env settings:

- `AUDIO_UPLOAD_MAX_BYTES`
- `AUDIO_RETENTION_DAYS`
- `SUPABASE_AUDIO_ORIGINALS_BUCKET`
- `SUPABASE_TRANSLATION_ARTIFACTS_BUCKET`

No mobile Supabase Storage or Trigger.dev client was added. Expo public env remains limited to public API/Clerk settings.

## Validation

Commands run:

```bash
node --check server/storage.mjs
node --check server/env.mjs
node --check server/index.mjs
node --check server/translations.mjs
npm run typecheck
```

Focused helper smoke check:

```text
sample.m4a -> audio/x-m4a, 5 bytes, Buffer decoded
invalid base64 -> 400 invalid_audio_base64
```

## Compatibility Decision

`/v1/translate-audio` remains synchronous for this task. The route now stores original audio as part of the sync path so Task 06 can add async dispatch without introducing a separate mobile Storage contract.
