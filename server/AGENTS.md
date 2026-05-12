# AGENTS.md

## Scope

Local Node/Express API for audio transcription, transcript consolidation, and translation.

## Current Pipeline

`POST /v1/translations` accepts:

```json
{ "filename": "audio.m4a", "audio_base64": "..." }
```

Flow:

1. Verify the Clerk session from `Authorization: Bearer <session_token>`.
2. Resolve or create the Supabase profile for the Clerk user.
3. Validate filename and base64 audio.
4. Store the original audio in private Supabase Storage.
5. Create a translation row and dispatch `trigger/translate-audio-job.mjs`.
6. Return `202` with `jobId`, `triggerRunId`, `status: queued`, and `detailUrl`.
7. Serve polling through authenticated `GET /v1/translations/:id`.

`POST /v1/translate-audio` and `POST /translate-audio` are legacy-compatible aliases for the same async flow.

The Trigger worker owns provider execution:

1. Claim the stored job.
2. Download stored audio.
3. Start Modal Darija ASR and OpenAI STT in parallel.
4. Require both transcripts to be non-empty.
5. Send both transcripts to OpenAI consolidation.
6. Send consolidated Arabic/Darija transcript to OpenAI translation.
7. Persist raw transcripts, consolidated transcript, English translation, aliases, model metadata, and final status.

## Backend Rules

- Keep OpenAI and Modal credentials server-side only.
- Do not translate from only one STT source unless the user explicitly changes the product requirement.
- Keep consolidation and translation as separate OpenAI calls for traceability.
- Keep structured trace logs, but do not log secrets.
- Do not log full transcripts by default in production-ready work; log lengths, model names, timings, and trace IDs.
- Any future auth, paywall, entitlement, and usage-meter checks must happen before model calls.
- Keep `/health` public.

## Fresh Clerk User QA Logs

During a fresh-user E2E test, verify the API logs show:

- Health check from the simulator.
- Profile resolved for the new Clerk `userId`.
- Async translation request received with filename, byte counts, and MIME type.
- Async translation queued with `jobId` and `triggerRunId`.
- History detail polling transitions from `queued` to `running` to `succeeded`.
- No `Unauthorized`, `clerk_session_missing`, storage, Trigger dispatch, Modal, or OpenAI errors.

Do not log full transcripts, Clerk session tokens, or secret env values while collecting evidence.

## Environment

Required:

- `OPENAI_API_KEY`
- `DARIJA_ASR_API_KEY`
- `DARIJA_ASR_BASE_URL` or `DARIJA_ASR_URL`

Model defaults:

- `OPENAI_TRANSCRIPTION_MODEL=gpt-4o-mini-transcribe`
- `OPENAI_CONSOLIDATION_MODEL=gpt-5.5`
- `OPENAI_TRANSLATION_MODEL=gpt-5.5`

## Verification

```bash
node --check server/index.mjs
npm run api
curl http://localhost:8787/health
```

Expected health shape:

```json
{
  "ok": true,
  "dependencies": { "darija_asr": true, "openai": true },
  "models": {
    "openai_transcription": "gpt-4o-mini-transcribe",
    "consolidation": "gpt-5.5",
    "translation": "gpt-5.5"
  }
}
```
