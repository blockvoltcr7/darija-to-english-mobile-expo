# AGENTS.md

## Scope

Local Node/Express API for audio transcription, transcript consolidation, and translation.

## Current Pipeline

`POST /translate-audio` accepts:

```json
{ "filename": "audio.m4a", "audio_base64": "..." }
```

Flow:

1. Validate filename and base64 audio.
2. Start Modal Darija ASR and OpenAI STT in parallel.
3. Require both transcripts to be non-empty.
4. Send both transcripts to OpenAI consolidation.
5. Send consolidated Arabic/Darija transcript to OpenAI translation.
6. Return raw transcripts, consolidated transcript, English translation, aliases, and model metadata.

## Backend Rules

- Keep OpenAI and Modal credentials server-side only.
- Do not translate from only one STT source unless the user explicitly changes the product requirement.
- Keep consolidation and translation as separate OpenAI calls for traceability.
- Keep structured trace logs, but do not log secrets.
- Do not log full transcripts by default in production-ready work; log lengths, model names, timings, and trace IDs.
- Any future auth, paywall, entitlement, and usage-meter checks must happen before model calls.

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
