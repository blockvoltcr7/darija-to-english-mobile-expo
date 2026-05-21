# 01 Executive Summary

## What

Add server-generated English speech playback for completed Darija-to-English translation jobs using OpenAI `gpt-4o-mini-tts`.

## Why

The app already turns Moroccan Darija audio into English text. The next user-facing improvement is to let the user hear the completed English translation without manually copying it into another text-to-speech tool.

OpenAI is the first provider because the backend already uses OpenAI server-side for transcription, consolidation, and translation in `server/translation-pipeline.mjs`. This minimizes new provider sprawl and keeps paid model calls behind the existing Node/Express + Trigger.dev boundary.

## Scope In

- Add server-side OpenAI TTS generation after English translation succeeds.
- Store generated English audio in private Supabase Storage under the existing `translation-artifacts` bucket boundary.
- Persist TTS artifact metadata with ownership by Clerk user ID.
- Return authenticated playback metadata from `GET /v1/translations/:id`.
- Add mobile Play UI when TTS audio is available.
- Add diagnostics for TTS status, provider, model, voice, format, and failures.
- Keep provider keys server-side only.
- Make TTS idempotent across Trigger retries and repeated polling.

## Scope Out

- No direct OpenAI calls from Expo.
- No custom OpenAI voices in MVP.
- No ElevenLabs, Gemini, xAI, or LiveKit implementation in MVP.
- No realtime speech streaming in MVP.
- No phone-call or LiveKit voice-agent flow.
- No Darija speech synthesis in MVP; the generated speech is English only.
- No autoplay.
- No public unauthenticated audio URLs.

## Business Impact

- Increases accessibility and perceived product completeness with a listenable English result.
- Keeps implementation cost low by reusing OpenAI and existing async job infrastructure.
- Creates an artifact model that can later support provider bakeoffs, retention policy, and usage controls.
- Reduces release risk by treating TTS as an add-on: text translation can still succeed if TTS fails.
