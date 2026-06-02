# Consent Submit Boundary Anchors

## Client Anchors

- `lib/api.ts`: `translateAudioFile()` posts `{ filename, audio_base64 }` to `/v1/translations` with `Authorization: Bearer <token>`.
- `app/translate.tsx`: obtains Clerk session tokens before translation and owns record/upload submission UI.
- `app/translate.tsx`: diagnostics currently record request/status details; do not log consent tokens or private content.

## Server Anchors

- `server/index.mjs`: `requireClerkSession` sets `req.clerkAuth.userId`.
- `server/index.mjs`: `/v1/translations` currently calls `requireClerkSession`, `ensureProfileForRequest`, then `handleCreateTranslation`.
- `server/index.mjs`: legacy submit aliases `/v1/translate-audio` and `/translate-audio` also call `ensureProfileForRequest` before execution.
- `server/index.mjs`: `handleCreateTranslation()` currently validates payload, creates a job, uploads original audio, then dispatches Trigger. Consent enforcement must happen before those steps.
- `server/index.mjs`: `handleTranslateAudio()` legacy sync path stores audio and directly runs the provider pipeline; protect it too.

## PRD Copy Anchors

- `06-technical-specifications.md`: consent copy must identify audio file, generated transcripts, generated translations, model metadata, generated English audio where applicable, and OpenAI/Modal-hosted Darija ASR.
- `07-ui-and-store-metadata-changes.md`: signup and reviewer notes should include AI processing and limitation copy.
- `10-risk-assessment.md`: third-party AI disclosure is a high App Store rejection risk.
