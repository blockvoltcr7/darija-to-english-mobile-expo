# TTS Provider Comparison

Research date: 2026-05-21

Scope: generate English speech after the Darija-to-English translation is complete.
All provider calls must run server-side in the Node/Express API or Trigger.dev worker.

## Ranking For This App

| Rank | Provider | Best candidate | Why |
| ---: | --- | --- | --- |
| 1 | OpenAI | `gpt-4o-mini-tts` | Best first fit because OpenAI is already in the backend pipeline, has current TTS docs, English-optimized voices, streaming/file output, and a small integration surface. |
| 2 | ElevenLabs | `eleven_flash_v2_5` | Strong voice quality and predictable character/credit style usage. Good if voice quality matters more than provider simplicity. |
| 3 | Gemini | `gemini-3.1-flash-tts-preview` | Newest Gemini TTS model and viable, but preview-model churn and PCM wrapping/transcoding add integration risk. |
| 4 | xAI/Grok | Grok TTS API | Simple REST API and expressive tags, but direct xAI pricing needs console verification. |
| 5 | LiveKit | LiveKit Agents / Inference | Great for realtime voice agents, WebRTC rooms, calls, interruption handling, and turn detection. Too much platform for simple completed-translation playback. |

## Price Snapshot

Prices are public-list snapshots, not account commitments.

| Provider | Pricing unit | Current planning price | Cost note |
| --- | --- | ---: | --- |
| OpenAI `gpt-4o-mini-tts` | Text input tokens + audio output tokens | `$0.60 / 1M` text input tokens + `$12.00 / 1M` audio output tokens | Best measured with real generated audio duration and dashboard usage. |
| OpenAI `tts-1` | Characters | `$15.00 / 1M` characters | Predictable fallback, lower quality than current model. |
| OpenAI `tts-1-hd` | Characters | `$30.00 / 1M` characters | Quality fallback, likely not needed first. |
| ElevenLabs Flash/Turbo API | Credits/characters | Roughly half-credit per character on self-serve plans; product page also positions Flash around `$0.06/min` | Use `eleven_flash_v2_5`; store generated audio once. |
| ElevenLabs Multilingual/v3 | Credits/characters | Roughly one credit per character; product page positions v3 around `$0.12/min` | Premium/expressive option, not default. |
| Gemini 3.1 Flash TTS Preview | Tokens | `$1.00 / 1M` text input tokens + `$20.00 / 1M` audio output tokens | About `$0.03/min` of audio output at 25 audio tokens/sec. |
| Gemini 2.5 Flash Preview TTS | Tokens | `$0.50 / 1M` text input tokens + `$10.00 / 1M` audio output tokens | About `$0.015/min`; cheaper Gemini fallback. |
| xAI/Grok direct API | Characters | `$15.00 / 1M` characters in current direct docs checked by parent research | Provider report flags historical/public-surface inconsistencies; verify in xAI Console. |
| LiveKit Inference xAI TTS | Characters | `$4.20 / 1M` characters in LiveKit inference table | This is LiveKit gateway pricing, not proof of direct xAI account pricing. |
| LiveKit Inference ElevenLabs Flash | Characters | `$150 / 1M` characters Build/Ship, `$60 / 1M` Scale | More expensive than direct ElevenLabs for simple playback. |
| LiveKit Inference Cartesia Sonic | Characters | `$50 / 1M` Build/Ship, `$37.50 / 1M` Scale | Relevant only if adopting LiveKit voice-agent platform. |

## Cost Model For Short Translations

For English translation playback, assume generated speech is cached and stored once.
The dangerous cost pattern is regeneration, not one-time synthesis.

| Scenario | Approx text length | Provider implication |
| --- | ---: | --- |
| Short result | 500 English characters | xAI/OpenAI legacy at `$15/M chars` costs about `$0.0075`; ElevenLabs Flash uses about 250 credits; OpenAI current/Gemini depends mostly on audio duration. |
| Medium result | 1,500 English characters | xAI/OpenAI legacy at `$15/M chars` costs about `$0.0225`; ElevenLabs Flash uses about 750 credits. |
| Long result | 10,000 English characters | xAI/OpenAI legacy at `$15/M chars` costs about `$0.15`; Gemini/OpenAI current should be benchmarked by generated duration. |

For production unit economics, run a small benchmark over representative completed translations and record:

- English character count.
- Estimated spoken duration.
- Output byte size.
- Provider-reported usage, if available.
- Dashboard billable cost.
- Regeneration count.

## Provider Notes

## OpenAI

Best initial choice because this repo already uses OpenAI server-side in
`server/translation-pipeline.mjs` for transcription, consolidation, and translation.

Strengths:

- Current recommended model: `gpt-4o-mini-tts`.
- Built-in English-optimized voices, with `marin` and `cedar` recommended in docs.
- Supports `mp3`, `aac`, `opus`, `flac`, `wav`, and `pcm`.
- `aac` or `mp3` are good defaults for Expo playback.
- `instructions` can steer tone, speed, accent, and style.

Risks:

- `gpt-4o-mini-tts` bills audio output tokens, so real cost should be measured.
- Speech API input limits mean long translations may need chunking.
- Users must be told the generated voice is AI-generated.
- Trigger retries can double-charge unless idempotent.

Recommendation: start with `gpt-4o-mini-tts`, `voice=marin` or `cedar`,
`response_format=aac` or `mp3`, feature-flagged off by default.

## ElevenLabs

Best quality/voice alternative.

Strengths:

- `eleven_flash_v2_5` is the affordable low-latency default candidate.
- MP3 output is straightforward for storage and mobile playback.
- Rich voice library and voice settings.
- Larger character limits than several competitors.

Risks:

- Free tier is not a production fit: no commercial license and Voice Library API limits.
- Voice access and output quality can be plan-gated.
- Voice cloning is out of scope for MVP because it adds consent and abuse controls.
- Repeated regeneration burns credits quickly.

Recommendation: use only if listening tests beat OpenAI enough to justify another provider.
Default to `eleven_flash_v2_5`, fixed account-owned English voice, `mp3_44100_128`.

## Gemini

Best Google/newest-model option, but less simple than OpenAI or ElevenLabs for this repo.

Strengths:

- Newest model researched: `gemini-3.1-flash-tts-preview`.
- Natural-language control over style, accent, pace, and tone.
- Good candidate for multi-speaker or highly directed narration later.
- `gemini-2.5-flash-preview-tts` is a cheaper fallback while available.

Risks:

- Preview models may change and have restrictive limits.
- Output handling requires decoding/wrapping PCM or transcoding to a mobile-friendly file.
- Free-tier data use may not match privacy expectations for user translation text.
- Rate limits must be checked inside the actual Google project.

Recommendation: prototype if Google provider fit matters, but do not make it default before
device playback and rate-limit QA.

## xAI / Grok

Promising experimental candidate.

Strengths:

- Simple `POST https://api.x.ai/v1/tts` JSON shape.
- Built-in English voices and expressive speech tags.
- MP3 default output.
- Direct REST is a clean fit for backend post-translation generation.

Risks:

- Public pricing surfaces have changed and should be verified in the xAI Console.
- Direct xAI docs checked in parent research use `$15 / 1M characters`; LiveKit still shows
  xAI TTS at `$4.20 / 1M characters`.
- No need for Grok realtime/voice-agent features in this app's current async flow.

Recommendation: include in a bakeoff, but do not choose as default until account-specific price
and quota are confirmed.

## LiveKit

Wrong first tool for completed-translation playback, right later tool for realtime voice.

Strengths:

- LiveKit Agents supports realtime STT-LLM-TTS, realtime models, half-cascade pipelines,
  turn detection, interruption handling, WebRTC rooms, and telephony.
- LiveKit Inference can route to many providers through one platform.
- Good fit for future phone-call interpretation or voice-agent experiences.

Risks:

- Adds LiveKit Cloud/project credentials, participant tokens, agent deployment, native Expo
  WebRTC setup, and session billing.
- Direct provider TTS is simpler and cheaper for one generated audio artifact.
- Expo Go is not enough for LiveKit; dev-client/native builds are required.

Recommendation: defer until the product needs live voice interaction, not just "play the
completed English translation."

## Recommended Bakeoff

Before implementation, generate the same 5-10 completed English translations with:

1. OpenAI `gpt-4o-mini-tts`, `marin`, `aac` or `mp3`.
2. ElevenLabs `eleven_flash_v2_5`, one fixed English voice, `mp3_44100_128`.
3. Gemini `gemini-3.1-flash-tts-preview`, one neutral voice, WAV or MP3 after transcoding.
4. xAI/Grok TTS, `ara` or `eve`, MP3.

Judge:

- Naturalness.
- Clarity on Moroccan names, places, dates, numbers, and legal/administrative terms.
- Time to first usable file.
- Output file size.
- Actual dashboard cost.
- API failure behavior.
- iOS simulator playback compatibility.
- Android emulator playback compatibility.

## Sources

See provider-specific research files under `providers/` for source links and detailed notes.
