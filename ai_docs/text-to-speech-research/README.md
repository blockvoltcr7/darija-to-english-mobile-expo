# Text-to-Speech Research Package

Research date: 2026-05-21

## Purpose

This package evaluates text-to-speech providers for a new product requirement:
after a Moroccan Darija audio translation completes and the app has final English text,
the system should generate spoken English audio for playback.

The current app flow is:

1. Expo app sends authenticated audio to `POST /v1/translations` through `lib/api.ts`.
2. `server/index.mjs` verifies Clerk, stores the original audio in private Supabase Storage,
   creates a translation job, and dispatches `trigger/translate-audio-job.mjs`.
3. `trigger/translate-audio-job.mjs` calls `server/translation-pipeline.mjs`.
4. `server/translation-pipeline.mjs` runs Modal Darija ASR and OpenAI STT in parallel,
   consolidates the transcripts, translates the consolidated Darija to English, and persists
   the result.
5. The Expo app polls `GET /v1/translations/:id` and shows the English translation,
   consolidated Darija, raw transcripts, model metadata, and diagnostics.

TTS should be added after step 4, only after `englishText` exists.

## Files

| File | Purpose |
| --- | --- |
| `provider-comparison.md` | Cross-provider pricing, fit, risks, and recommendation. |
| `implementation-plan.md` | Repo-specific architecture plan for adding generated English audio. |
| `providers/grok-xai.md` | xAI/Grok TTS research. |
| `providers/google-gemini.md` | Gemini TTS research. |
| `providers/openai.md` | OpenAI TTS research. |
| `providers/elevenlabs.md` | ElevenLabs TTS research. |
| `providers/livekit.md` | LiveKit voice/TTS platform research. |

## Decision Summary

Best first implementation for this repo:

1. Add a server-side TTS abstraction after English translation succeeds.
2. Generate one audio artifact per translation job.
3. Store the generated audio in private Supabase Storage, under the existing
   translation artifacts boundary.
4. Persist provider/model/voice/format/bytes/status metadata.
5. Return authenticated playback metadata from `GET /v1/translations/:id`.
6. Show a Play control in `app/translate.tsx` and `app/history.tsx` only when TTS succeeded.

Recommended provider path:

1. **OpenAI `gpt-4o-mini-tts` first**, because this app already has server-side OpenAI
   infrastructure, the model is the current OpenAI TTS target, it supports English-optimized
   voices, and it keeps provider sprawl low.
2. **ElevenLabs `eleven_flash_v2_5` as the quality/voice alternative**, especially if OpenAI
   listening tests sound too flat or if voice quality becomes a product differentiator.
3. **Gemini `gemini-3.1-flash-tts-preview` only if the project wants the newest Google model**;
   also test `gemini-2.5-flash-preview-tts` as the lower-cost Gemini fallback.
4. **xAI/Grok TTS as an experimental price/quality candidate**, but verify account-specific
   pricing in the xAI Console before choosing it.
5. **Defer LiveKit** for this specific feature. It is a realtime voice-agent platform, not the
   simplest way to play a completed translation.

## Non-Negotiables

- Do not call TTS providers from Expo.
- Do not expose `OPENAI_API_KEY`, `ELEVENLABS_API_KEY`, `GEMINI_API_KEY`, or `XAI_API_KEY`
  through `EXPO_PUBLIC_*`.
- Do not log full English translations, provider audio bytes, Clerk session tokens, or API keys.
- Do not regenerate audio on every poll or screen open.
- Make Trigger retries idempotent so TTS does not double-bill.
- Keep text translation success independent from TTS success unless the product explicitly
  decides that a translation is incomplete without spoken audio.
