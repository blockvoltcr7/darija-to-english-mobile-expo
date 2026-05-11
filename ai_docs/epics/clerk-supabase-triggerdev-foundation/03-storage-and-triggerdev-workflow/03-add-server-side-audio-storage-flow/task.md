# Task 03: Add Server-Side Audio Storage Flow

## Type

Code

## Context

The current mobile/API contract posts `{ filename, audio_base64 }` to `POST /v1/translate-audio`, and `server/index.mjs` runs providers synchronously after Clerk verification. Epic 03 keeps mobile bucket credentials out of the app by decoding, validating, and uploading audio on the server before any async worker processes it. This task creates the storage helper boundary used by both the future async route and any temporary sync compatibility path.

## Implementation

- Add `server/storage.mjs` with helpers for base64 decode, MIME/extension normalization, object key construction, upload, download, and removal through `getSupabaseAdminClient().storage`.
- Extend `server/env.mjs` and `.env.example` with bucket names, max decoded audio bytes, allowed audio MIME types, and default audio retention days.
- Store original audio with `upsert: false`, explicit `contentType`, stable cache control, and object keys from Task 02. Do not use raw Clerk IDs or user filenames in keys.
- Extend `server/translations.mjs` with methods to attach storage metadata and read worker-ready job records.
- Ensure oversized or unsupported files fail before Storage upload, Trigger.dev dispatch, or paid provider calls.

## Acceptance Criteria

- [ ] Server-side helper can upload original audio to `audio-originals` and record bucket/key/size/MIME on the job.
- [ ] Invalid base64, unsupported MIME/extension, or oversized audio fails before provider or Trigger.dev work.
- [ ] Upload uses server-side Supabase credentials only and never exposes bucket credentials to mobile.
- [ ] Partial failure behavior is defined: uploaded object cleanup is attempted if the DB metadata write fails.
- [ ] Existing `/v1/translate-audio` compatibility is preserved or explicitly documented as unchanged until Task 06.

## Dependencies

- Depends On: add-storage-metadata-to-jobs
- Blocks: add-triggerdev-project-config
- Blocks: add-triggerdev-translation-task
- Blocks: dispatch-triggerdev-from-api

## Technical Notes

- Existing payload validation lives in `server/index.mjs`; keep any shared validation in server-only modules rather than `lib/` if it touches secrets or provider assumptions.
- Existing Supabase admin client lives in `server/db.mjs`; do not create a mobile/client Supabase Storage path.
- Use bucket limits as defense in depth only. The server must validate decoded bytes before upload.
- Supabase docs warn against deleting Storage objects by SQL because it can orphan files; cleanup helpers must call the Storage API.
- Reference files: `server/env.mjs`, `server/db.mjs`, `server/translations.mjs`, `server/index.mjs`, `.env.example`.

## Artifact Slots

- `artifacts/`: storage helper smoke output, object metadata sample, and failure/cleanup trace.
- `references/`: storage diagram, current upload flow, and Supabase upload/delete docs notes.
- `resources/`: sample base64 payloads, MIME cases, and expected object keys.
- `notes/`: size/MIME decisions, retention default, and partial-failure handling.
