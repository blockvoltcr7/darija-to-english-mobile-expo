# Arabic Response Audio Research

Research date: 2026-06-01

Branch: `codex/arabic-response-voice-research`

## Problem

The app can already turn an incoming Moroccan Darija voice note into English text
and English AI-generated playback. The missing workflow is the reverse user
need:

1. The English-speaking user records a reply.
2. The backend converts that English speech into Moroccan Darija / Arabic text.
3. The backend synthesizes Arabic/Darija speech.
4. The user can play and share the generated audio file back to the Arabic
   speaker.

This is not a TestFlight deployment task. Keep it in development until the
provider choice and Arabic/Darija listening quality are verified.

## Recommendation

Start with a server-side cascade:

```text
English speech -> English STT -> Moroccan Darija text -> Arabic/Darija TTS -> stored audio artifact
```

Do not start with realtime speech-to-speech. The user needs a sendable audio
file, not a live conversation session. The existing Trigger.dev, Convex, and
private storage pipeline is already shaped for async file generation.

## Ranked Options

| Rank | Stack | Why | Risk |
| ---: | --- | --- | --- |
| 1 | OpenAI end-to-end | Lowest implementation cost. The app already uses OpenAI in the server pipeline. OpenAI TTS supports multiple languages and mobile-friendly formats. | Arabic voice may sound generic rather than Moroccan Darija. |
| 2 | OpenAI translation + Azure `ar-MA` TTS | Best Morocco-specific TTS support found in research. | Adds a new provider and env contract. |
| 3 | OpenAI/Gemini translation + ElevenLabs Arabic TTS | Strong voice quality and Arabic support. | No clear Moroccan/Darija-specific guarantee. |
| 4 | Gemini / Vertex Live API | Strong realtime audio platform and Arabic support. | More complexity than needed for file output; Moroccan TTS support is not explicit. |
| 5 | LiveKit Agents | Best later if the product becomes live conversation or calls. | Too much WebRTC/session infrastructure for one reply audio file. |
| 6 | Deepgram | Strong STT option, including Arabic dialect codes for STT. | Aura TTS language support is currently English/Spanish, so it is not the Arabic TTS answer. |
| 7 | xAI / Grok | New speech APIs are worth tracking. | Current official speech docs are stronger for STT than proven Moroccan/Darija TTS fit. |

## MVP Stack

Use OpenAI first:

| Step | Provider | Candidate |
| --- | --- | --- |
| English STT | OpenAI | `gpt-4o-mini-transcribe` |
| Darija generation | OpenAI Responses | Current translation model with a new English-to-Moroccan-Darija prompt |
| Arabic/Darija TTS | OpenAI | `gpt-4o-mini-tts` |
| Audio format | OpenAI output | `mp3` first for sharing, `aac` also acceptable |
| Storage | Convex Storage | Existing private artifact storage |
| Worker | Trigger.dev | Existing async job path |

The MVP should be labelled as an Arabic/Darija audio preview until Moroccan
listening QA confirms naturalness.

## Best-Quality Bakeoff

Run a small provider bakeoff before production:

1. OpenAI `gpt-4o-mini-tts`.
2. Azure Speech `ar-MA-MounaNeural`.
3. Azure Speech `ar-MA-JamalNeural`.
4. ElevenLabs Arabic-capable model.
5. Gemini TTS / Vertex option if Google project setup is available.

Use the same 10-20 English reply scripts and judge:

- Moroccan Darija naturalness.
- Whether the text sounds like spoken Darija instead of formal MSA.
- Pronunciation of names, places, French loanwords, and numbers.
- File generation latency.
- Output file size.
- Actual dashboard cost.
- Whether the audio is clear enough to send in WhatsApp/iMessage.

## Repo Fit

The current implementation already has most of the required infrastructure:

| Current surface | Role |
| --- | --- |
| `app/translate.tsx` | Existing recording/upload UI and result rendering. |
| `lib/api.ts` | Authenticated POST and polling for translation jobs. |
| `server/index.mjs` | Clerk auth, upload validation, Convex storage, Trigger dispatch, detail responses, authenticated audio playback. |
| `server/translation-pipeline.mjs` | Provider orchestration and optional TTS artifact generation. |
| `server/tts/` | OpenAI TTS router/provider code. |
| `server/artifacts.mjs` | Artifact repository wrapper. |
| `server/storage.mjs` | Convex storage upload/download helpers. |
| `trigger/translate-audio-job.mjs` | Thin Trigger.dev worker entrypoint. |
| `convex/schema.ts` and `convex/artifacts.ts` | Convex artifact schema and queries/mutations. |

## Implementation Shape

There are two reasonable data models:

1. Add a separate response job type.
2. Generalize the existing translation job and add a `direction` field.

For the first cut, prefer a new mode on the existing pipeline and a new artifact
kind. This keeps compatibility with the existing `tts` field.

Suggested API additions:

```text
POST /v1/response-audio
GET  /v1/response-audio/:id
GET  /v1/response-audio/:id/artifacts/arabic-audio
```

Suggested artifact addition:

```text
kind = "arabic_response_tts_audio"
language = "ar"
```

Keep existing English playback response fields unchanged:

```text
tts = English translation audio
arabicTts or responseAudio = Arabic/Darija reply audio
```

## Required Code Changes

1. Widen Convex artifact schema:
   - `translationArtifacts.kind`: include `arabic_response_tts_audio`.
   - `translationArtifacts.language`: include `ar`.
   - Artifact identity indexes should include `kind`, provider, model, voice,
     format, and input hash.

2. Generalize server artifact helpers:
   - Replace hard-coded English artifact lookups with kind-aware helpers.
   - Keep old English helper aliases for existing UI compatibility.

3. Add response-audio pipeline:
   - Transcribe English input with OpenAI.
   - Generate Moroccan Darija reply text with a strict prompt.
   - Synthesize Arabic/Darija audio.
   - Store generated audio once in Convex Storage.
   - Return owner-only playback URL.

4. Split TTS config:
   - Keep `ENABLE_TTS` for existing English playback.
   - Add `ENABLE_RESPONSE_TTS`.
   - Add `RESPONSE_TTS_PROVIDER=openai`.
   - Add `RESPONSE_TTS_LANGUAGE=ar`.
   - Add `RESPONSE_TTS_FORMAT=mp3`.
   - Add `OPENAI_RESPONSE_TTS_MODEL=gpt-4o-mini-tts`.
   - Add `OPENAI_RESPONSE_TTS_VOICE=<selected voice>`.

5. Mobile UI:
   - Add a reply mode, not a TestFlight release path.
   - Reuse the recorder/upload controls.
   - Render generated Arabic/Darija text.
   - Add playback and share controls for the Arabic audio file.
   - Keep AI-generated voice disclosure.

## Prompting Notes

The key prompt should not say only "translate to Arabic". That will often
produce MSA. It should ask for short, natural Moroccan Darija in Arabic script,
with these constraints:

- Preserve meaning exactly.
- Keep it concise enough to send as a voice-note reply.
- Use Moroccan Darija phrasing when natural.
- Do not invent facts, names, times, places, or commitments.
- Preserve important French loanwords if they are natural in Moroccan speech.
- Avoid formal MSA unless the phrase would naturally be formal.
- Output only the reply text that should be spoken.

## Sources Checked

- OpenAI text-to-speech docs: `gpt-4o-mini-tts`, speech endpoint, multiple-language audio, streaming/file output.
- OpenAI realtime docs: voice-agent, realtime translation, transcription, and speech-generation architectures.
- Deepgram model/language docs: STT includes Arabic dialect codes including `ar-MA`.
- Deepgram Aura TTS docs: current TTS language support is English and Spanish.
- Google Gemini TTS docs: Arabic Egypt is GA; Gemini Live supports Arabic and audio output.
- LiveKit OpenAI integration docs: strong realtime voice-agent bridge, including OpenAI Realtime and TTS models.
- ElevenLabs language docs: Arabic support in Eleven v3, Turbo v2.5, Flash v2.5.
- xAI speech docs: speech-to-text REST/streaming is documented; voice stack should be tracked but is not the first MVP choice.

## Decision

Build the MVP as `English speech -> OpenAI STT -> OpenAI Moroccan Darija text ->
OpenAI Arabic/Darija TTS -> Convex stored MP3`. Add Azure `ar-MA` voices as the
first quality fallback if OpenAI pronunciation is not good enough.

