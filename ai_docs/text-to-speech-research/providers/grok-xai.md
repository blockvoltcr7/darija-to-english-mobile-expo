# Grok / xAI Text-to-Speech Research

Research date: 2026-05-21

## Bottom Line

xAI now has a public Grok Voice/Text to Speech API surface that can synthesize English speech from translated text through a backend call to `POST https://api.x.ai/v1/tts`. It is viable for a Node/Express + Trigger.dev pipeline because the API accepts simple JSON, supports MP3 output by default, and can be kept fully server-side.

Do not treat public pricing as settled without checking the xAI Console before implementation. The newest/current official model, voice overview, TTS guide, and public voice product pages show Text to Speech at **$15.00 / 1M input characters**, while the official pricing page still shows **$4.20 / 1M characters**. For planning, use the conservative $15.00/M character number.

## Current Offering

- Provider: xAI / Grok Voice API
- Product surface: Text to Speech API
- Endpoint: `POST https://api.x.ai/v1/tts`
- Streaming endpoint: `wss://api.x.ai/v1/tts`
- Model name: xAI does not expose a separate TTS model ID in the public TTS request shape. The docs present this as the Grok Voice/Text to Speech API rather than a `model` parameter.
- Primary use for this app: generate English speech after the Darija-to-English translation job has completed.

## API Availability

The public docs include REST, WebSocket streaming, JavaScript examples, API-key auth, and xAI Console/playground links. REST TTS takes JSON like:

```json
{
  "text": "English translation text...",
  "voice_id": "eve",
  "language": "en"
}
```

The request must be made from the backend. xAI explicitly warns not to expose the API key in client-side code for streaming, and the same key-handling rule should apply to REST from this Expo app.

## Voices and Language Support

Built-in voices documented for TTS are:

- `ara`
- `eve` (default)
- `leo`
- `rex`
- `sal`

The TTS API supports `language: "en"` and other BCP-47 language codes. The REST API reference lists supported values including `auto`, `en`, `ar-EG`, `ar-SA`, `ar-AE`, `bn`, `zh`, `fr`, `de`, `hi`, `id`, `it`, `ja`, `ko`, `pt-BR`, `pt-PT`, `ru`, `es-MX`, `es-ES`, `tr`, and `vi`; it also says additional languages may work with varying accuracy.

For this app, English-only output is the low-risk path. Moroccan Darija synthesis is not the target here, and I did not find a documented `ar-MA`/Moroccan Arabic TTS support guarantee.

## Output Formats

REST defaults to MP3 at 24 kHz / 128 kbps. Documented codecs and settings include:

- Codecs: `mp3`, `wav`, `pcm`, `mulaw`/`ulaw`, `alaw`
- Sample rates: `8000`, `16000`, `22050`, `24000`, `44100`, `48000`
- MP3 bit rates: `32000`, `64000`, `96000`, `128000`, `192000`

For the Expo app, MP3 is the simplest default for storage, playback, and sharing. `mulaw`/`alaw` are more relevant to telephony than in-app playback.

## Streaming and Latency

xAI supports both batch REST output and bidirectional WebSocket streaming. Streaming accepts incremental `text.delta` messages and returns base64-encoded `audio.delta` chunks before the full text is complete.

Important documented limits/behavior:

- REST max text length: 15,000 characters per request.
- WebSocket total text: no total limit, but each `text.delta` is capped at 15,000 characters.
- WebSocket concurrent sessions: 50 per team.
- REST/model rate limits shown on current public pages: 3,000 RPM, 50 RPS, 100 concurrent sessions per team.
- Streaming latency can be tuned with `optimize_streaming_latency`; lower latency trades off some quality at chunk boundaries.

For the current Darija-to-English flow, REST is the better first integration because speech generation happens after translation completion. Streaming is useful later if the UI starts speaking while a long translation is still being generated.

## Pricing and Affordability

Current official xAI pages are inconsistent:

- Current model/voice/TTS/product surfaces show Text to Speech at **$15.00 / 1M input characters**.
- The official pricing page, last updated earlier, shows **$4.20 / 1M input characters**.

Conservative planning at $15.00/M characters:

| English translation length | Estimated TTS cost |
| --- | ---: |
| 500 characters | $0.0075 |
| 1,000 characters | $0.0150 |
| 1,500 characters | $0.0225 |
| 10,000 characters | $0.1500 |

If the lower $4.20/M price applies in the xAI Console, the same 1,000-character translation would cost about $0.0042. Either way, one-off speech generation after translation is affordable at typical short-translation lengths, but the conservative price is not as cheap as commodity TTS providers if users regenerate audio repeatedly.

Documented free tier/rate limits:

- I found public "try free" / playground language, but no precise public API free-credit amount for TTS.
- Public pages document request/session limits, but team-specific access and limits may vary in the xAI Console.
- Custom voice creation is documented as free in-console up to 30 voices, but API custom-voice creation is gated to Enterprise teams. This should not be part of the first app integration.

## Integration Fit for This Repo

Recommended backend shape:

1. Trigger translation job completes with English text.
2. Server-side TTS step calls `POST /v1/tts` with `language: "en"`, default `voice_id: "eve"` or a user-selectable built-in voice.
3. Store returned MP3 bytes in private Supabase Storage alongside the translation result.
4. Save a signed/downloadable audio path or storage object reference on the translation row.
5. Mobile app polls the existing translation result endpoint and renders a playback control when `english_audio` is available.

Implementation notes:

- Keep `XAI_API_KEY` in `.env.local`/server runtime only; never expose it through `EXPO_PUBLIC_*`.
- Use REST first; the existing async Trigger.dev pipeline does not need WebSocket streaming for post-completion narration.
- Use idempotency at the app layer. If the Trigger job retries after TTS succeeds but before persistence, avoid billing a duplicate synthesis when possible.
- Add usage reservation before provider calls, similar to other paid model calls in this app.
- Capture provider metadata: provider `xai`, endpoint `tts`, voice ID, language, codec, character count, pricing assumption, and xAI request/run correlation if available.
- Add text-length guardrails. Split or reject translation text above 15,000 characters for REST.
- Treat custom voices as out of scope unless the app needs Enterprise-only API voice creation.

## Risks and Unknowns

- Pricing ambiguity: official public pages disagree between $15.00/M and $4.20/M characters. Check the xAI Console before committing this provider as a production default.
- No documented TTS model ID: code should represent this as provider mode `xai_tts` rather than pinning an undocumented model string.
- Free tier ambiguity: public docs do not document a concrete free monthly TTS quota.
- Regional dependency: docs/model pages identify the voice/audio cluster as `us-east-1`; consider latency and data residency expectations.
- Moderation behavior: streaming docs say moderation runs asynchronously on accumulated text after audio is sent. For REST, do not assume all policy failures are pre-generation unless verified with API errors.
- Expo playback compatibility should be verified with generated MP3 files before release.

## Recommendation

xAI/Grok TTS is a credible backend-only candidate for English narration, especially if the team wants to keep speech features under the broader Grok/xAI API umbrella. For the first implementation, use REST MP3 generation after translation completion, store the audio server-side, and expose only the stored audio reference to the mobile app.

Before choosing it as the default provider, verify the account-specific Console price and available quota. At the conservative public $15.00/M character price, it is still affordable for short translations, but the pricing inconsistency makes it risky to document as a fixed-cost option without a live account check.

## Sources

- [xAI Text to Speech guide](https://docs.x.ai/developers/model-capabilities/audio/text-to-speech?campaign=custom-voices-blog)
- [xAI Voice overview](https://docs.x.ai/developers/model-capabilities/audio/voice)
- [xAI REST API reference: Voice / TTS](https://docs.x.ai/developers/rest-api-reference/inference/voice)
- [xAI Models page](https://docs.x.ai/developers/models)
- [xAI Pricing page](https://docs.x.ai/developers/pricing)
- [xAI Grok Voice product page](https://x.ai/api/voice)
- [xAI Custom Voices guide](https://docs.x.ai/developers/model-capabilities/audio/custom-voices)
