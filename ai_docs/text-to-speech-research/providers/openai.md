# OpenAI Text-to-Speech Research

Last verified: May 21, 2026. Sources are official OpenAI developer docs and pricing pages unless noted.

## Recommendation

Use OpenAI TTS from the backend only, after the Darija-to-English translation job has produced final English text. For this app, the best first implementation target is `gpt-4o-mini-tts` on `POST /v1/audio/speech`, returning `aac` or `mp3` for persisted playback and `wav` or `pcm` only when low-latency streaming playback is the priority.

Do not call OpenAI TTS from Expo. Keep `OPENAI_API_KEY` on the Node/Express API or Trigger.dev worker, store the generated audio in private storage, and return a signed or authenticated app endpoint to the mobile client.

## Current OpenAI TTS Models

| Model | Role | Current snapshot / alias | Quality and latency notes | Pricing unit |
| --- | --- | --- | --- | --- |
| `gpt-4o-mini-tts` | Current recommended speech generation model | Current snapshot is `gpt-4o-mini-tts-2025-12-15`; snapshots also include `gpt-4o-mini-tts-2025-03-20` | OpenAI calls it the newest and most reliable TTS model. Supports `instructions` for accent, emotion, intonation, tone, speed, whispering, and similar style controls. | `$0.60 / 1M` text input tokens plus `$12.00 / 1M` audio output tokens. |
| `tts-1` | Legacy/older speed-optimized TTS | `tts-1` | Optimized for realtime text-to-speech use cases; lower quality than `tts-1-hd`. | `$15.00 / 1M` input characters. |
| `tts-1-hd` | Legacy/older quality-optimized TTS | `tts-1-hd` | Optimized for high-quality text-to-speech; slower than `tts-1`. | `$30.00 / 1M` input characters. |

Sources: [Text to speech guide](https://developers.openai.com/api/docs/guides/text-to-speech), [GPT-4o mini TTS model page](https://developers.openai.com/api/docs/models/gpt-4o-mini-tts), [TTS-1 model page](https://developers.openai.com/api/docs/models/tts-1), [TTS-1 HD model page](https://developers.openai.com/api/docs/models/tts-1-hd), [pricing](https://developers.openai.com/api/docs/pricing).

## API Shape

Endpoint: `POST https://api.openai.com/v1/audio/speech`

Node SDK shape:

```ts
const audio = await openai.audio.speech.create({
  model: "gpt-4o-mini-tts",
  voice: "marin",
  input: englishTranslation,
  instructions: "Speak clearly in a warm, neutral voice.",
  response_format: "aac",
});

const buffer = Buffer.from(await audio.arrayBuffer());
```

Important request fields:

| Field | Notes |
| --- | --- |
| `model` | One of `gpt-4o-mini-tts`, `gpt-4o-mini-tts-2025-12-15`, `tts-1`, or `tts-1-hd`. The API reference also lists `gpt-4o-mini-tts-2025-12-15` directly. |
| `input` | Text to synthesize. The Speech API reference lists a 4096-character max; the `gpt-4o-mini-tts` model page lists a 2000 input-token max. Treat both as product constraints and chunk longer translations before calling TTS. |
| `voice` | Built-in voice name or eligible custom voice object. Custom voices require eligibility and consent workflow. |
| `instructions` | Works with `gpt-4o-mini-tts`; OpenAI says it does not work with `tts-1` or `tts-1-hd`. |
| `response_format` | Default is `mp3`; supported values are `mp3`, `opus`, `aac`, `flac`, `wav`, and `pcm`. |
| `speed` | Supported range is `0.25` to `4.0`, default `1.0`. |
| `stream_format` | API reference lists `sse` and `audio`; `sse` is not supported for `tts-1` or `tts-1-hd`. |

Sources: [Speech create API reference](https://developers.openai.com/api/reference/resources/audio/subresources/speech/methods/create), [Text to speech quickstart](https://developers.openai.com/api/docs/guides/text-to-speech).

## Voices and Language Support

OpenAI's TTS guide lists 13 built-in voices for the current TTS endpoint:

`alloy`, `ash`, `ballad`, `coral`, `echo`, `fable`, `nova`, `onyx`, `sage`, `shimmer`, `verse`, `marin`, `cedar`.

For best quality, OpenAI recommends `marin` or `cedar`. The older `tts-1` and `tts-1-hd` models support a smaller set: `alloy`, `ash`, `coral`, `echo`, `fable`, `onyx`, `nova`, `sage`, and `shimmer`.

Voices are currently optimized for English, which matches this app's immediate use case because speech generation happens after English translation. The guide says TTS generally follows Whisper language support and can generate spoken audio by providing input text in the target language, but for this project English output should be the default product path.

Source: [Text to speech guide](https://developers.openai.com/api/docs/guides/text-to-speech).

## Streaming, Latency, and Formats

The Speech API supports realtime audio streaming with chunked transfer encoding, so playback can begin before the full file is generated. For fastest response times, OpenAI recommends `wav` or `pcm` because they avoid heavier decode overhead. Format tradeoffs:

| Format | Fit for this app |
| --- | --- |
| `aac` | Good mobile default. OpenAI describes it as preferred by Android and iOS. |
| `mp3` | Default and broadly compatible. Good for persisted history playback. |
| `opus` | Best fit for internet streaming and communication, low latency. Validate Expo playback support before choosing it. |
| `wav` | Useful for low-latency playback and debugging, but larger files. |
| `pcm` | Raw 24 kHz 16-bit signed little-endian samples; good for streaming pipelines, less convenient for storage/playback. |
| `flac` | Lossless archive format; probably unnecessary for mobile playback. |

Source: [Text to speech guide, streaming and formats](https://developers.openai.com/api/docs/guides/text-to-speech#streaming-realtime-audio).

## Pricing and Affordability

OpenAI currently prices `gpt-4o-mini-tts` differently from the older TTS models:

| Model | Published price | What that means for translated English speech |
| --- | --- | --- |
| `gpt-4o-mini-tts` | `$0.60 / 1M` text input tokens + `$12.00 / 1M` audio output tokens | Likely the best feature/quality target, but final cost depends on generated audio output tokens. OpenAI does not publish a simple official "characters to audio tokens" conversion on the TTS docs, so production should log usage/billing from real jobs before committing to unit economics. |
| `tts-1` | `$15.00 / 1M` characters | Predictable character-based fallback. A 500-character English translation costs about `$0.0075`; 1,000 such jobs cost about `$7.50`. |
| `tts-1-hd` | `$30.00 / 1M` characters | Predictable but twice `tts-1`. A 500-character English translation costs about `$0.015`; 1,000 such jobs cost about `$15.00`. |

For this app, `gpt-4o-mini-tts` is still the best candidate to test first because the English translation text is short, the text-token input cost is tiny, and it gives the current voice-control surface. The risk is the audio-token side of billing: before enabling this broadly, run a small benchmark over representative completed translations and record actual dashboard costs by average translation length and generated audio duration.

Source: [GPT-4o mini TTS pricing](https://developers.openai.com/api/docs/models/gpt-4o-mini-tts), [TTS-1 pricing](https://developers.openai.com/api/docs/models/tts-1), [TTS-1 HD pricing](https://developers.openai.com/api/docs/models/tts-1-hd), [OpenAI pricing page](https://developers.openai.com/api/docs/pricing).

## Free Tier and Rate Limits

Documented model-page limits:

| Model | Free tier | Tier 1 | Tier 2 | Tier 3 | Tier 4 | Tier 5 |
| --- | --- | --- | --- | --- | --- | --- |
| `gpt-4o-mini-tts` | Not supported | `500 RPM`, `50,000 TPM` | `2,000 RPM`, `150,000 TPM` | `5,000 RPM`, `600,000 TPM` | `10,000 RPM`, `2,000,000 TPM` | `10,000 RPM`, `8,000,000 TPM` |
| `tts-1` | `3 RPM`, `200 RPD` | `500 RPM` | `2,500 RPM` | `5,000 RPM` | `7,500 RPM` | `10,000 RPM` |
| `tts-1-hd` | Not supported | `500 RPM` | `2,500 RPM` | `5,000 RPM` | `7,500 RPM` | `10,000 RPM` |

OpenAI notes rate limits vary by usage tier and can include requests, tokens, audio duration, or other caps. For a beta mobile app, assume `gpt-4o-mini-tts` requires a paid API account and add a server-side feature flag or kill switch before release.

Sources: [GPT-4o mini TTS rate limits](https://developers.openai.com/api/docs/models/gpt-4o-mini-tts), [TTS-1 rate limits](https://developers.openai.com/api/docs/models/tts-1), [TTS-1 HD rate limits](https://developers.openai.com/api/docs/models/tts-1-hd).

## Integration Risks for This Repo

Current pipeline context:

- `server/translation-pipeline.mjs` already owns OpenAI provider calls for transcription, consolidation, and English translation.
- `trigger/translate-audio-job.mjs` runs the stored translation job through that pipeline.
- `server/index.mjs` returns queued and polled translation results from `/v1/translations`.
- `lib/api.ts` maps the server detail response into mobile result fields.

Recommended integration shape:

1. Add TTS after `translateConsolidatedTranscript(...)` succeeds in `server/translation-pipeline.mjs`, not before. TTS should never run if translation failed.
2. Add server env config such as `OPENAI_TTS_MODEL=gpt-4o-mini-tts`, `OPENAI_TTS_VOICE=marin`, `OPENAI_TTS_RESPONSE_FORMAT=aac`, and a feature flag such as `ENABLE_OPENAI_TTS=false` by default.
3. Store generated speech as a private Supabase Storage artifact, separate from original audio. Do not return raw OpenAI URLs or expose provider credentials to Expo.
4. Persist artifact metadata with the translation result: provider, model, voice, format, byte size, duration if measured, storage path, and generated-at timestamp.
5. Expose audio through authenticated polling/detail responses only after the job succeeds.
6. Log TTS start/success/failure with `traceId`, `jobId`, `triggerRunId`, model, voice, format, input character count, and output byte count. Do not log private translation text or generated audio content.

Risks:

- **Cost observability:** `gpt-4o-mini-tts` bills audio output tokens, but the Speech endpoint returns binary audio. Add provider-run metadata and reconcile against dashboard usage before making TTS automatic for every job.
- **Job latency:** Adding TTS to the Trigger job extends end-to-end completion time. If playback is optional, consider a second task triggered after translation success so text results are available first.
- **Retry/idempotency:** Trigger retries could regenerate and double-charge TTS unless the job checks for an existing speech artifact before calling OpenAI.
- **Storage growth:** Generated audio adds persistent bytes per translation. Add retention policy alongside the existing original-audio cleanup plan.
- **Mobile format compatibility:** `aac` or `mp3` should be safest for Expo playback. Validate `opus`, `wav`, and streamed playback on iOS and Android before choosing them.
- **Disclosure:** OpenAI's TTS guide says users must be clearly told the voice is AI-generated, not human. Add disclosure in the playback UI before release.
- **Custom voices:** Custom voice creation is limited to eligible customers and has consent requirements. Do not plan custom Moroccan/brand voices for the first implementation unless account eligibility is confirmed.

## Bottom Line

Start with `gpt-4o-mini-tts`, `voice=marin` or `cedar`, and `response_format=aac` for saved mobile playback. Keep `tts-1` as the predictable-cost fallback if `gpt-4o-mini-tts` audio-token billing proves too expensive in real usage. Avoid `tts-1-hd` unless listening tests show a clear user-visible quality gain over `gpt-4o-mini-tts` or `tts-1`.
