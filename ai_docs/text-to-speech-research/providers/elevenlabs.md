# ElevenLabs Text-to-Speech Research

Research date: May 21, 2026

Scope: evaluate ElevenLabs as a backend-only provider for generating English speech after the Darija-to-English translation job completes. Sources prioritized official ElevenLabs docs, API reference, pricing, and help pages.

## Recommendation

ElevenLabs is viable for high-quality English playback, but for this app the affordable default would be `eleven_flash_v2_5`, not the newest `eleven_v3`.

Use `eleven_flash_v2_5` when the app needs quick post-translation playback and predictable cost. It supports English, has the lowest documented TTS latency at about 75 ms excluding application and network latency, supports up to 40,000 characters per request, and is discounted to 0.5 credits per text character on self-serve plans. Use `eleven_multilingual_v2` only when quality and number normalization matter more than price. Treat `eleven_v3` as an expressive/premium option for demos or polished narration, not the default production path, because ElevenLabs describes it as newest and most expressive but also more variable and higher latency, and not suited to real-time or conversational use cases.

For this Expo app, integrate ElevenLabs in the server/Trigger layer only. Do not expose the ElevenLabs API key to the mobile client. Generate audio after `english_translation` exists, store the MP3 in private Supabase Storage, and return a signed URL or authenticated download route from the API.

## Current Model Options

| Model ID | Best fit | Languages | Character limit | Latency/cost notes | App fit |
| --- | --- | --- | --- | --- | --- |
| `eleven_flash_v2_5` | Fast, affordable TTS | 32 languages including English | 40,000 | About 75 ms model latency, discounted credits, positioned as cost-effective | Best default for English translation playback |
| `eleven_flash_v2` | Fast English-only TTS | English | 30,000 | About 75 ms model latency | Good fallback if only English output is needed |
| `eleven_multilingual_v2` | Higher-quality narration | 29 languages including English and Arabic | 10,000 | Higher latency and cost than Flash, better number normalization | Use for premium audio or translations with numbers/dates/legal terms |
| `eleven_v3` | Newest expressive model | 70+ languages | Docs list 5,000 chars in the model overview; product page FAQ lists 3,000 | About $0.12/minute on product page; higher latency and more variable consistency | Not the affordable default; good for expressive demos |
| `eleven_turbo_v2_5` | Older balanced low-latency option | 32 languages | 40,000 | Product page still lists about 250-300 ms, but current model docs say Turbo is functionally replaced by lower-latency Flash | Prefer Flash over Turbo |

Notes:

- ElevenLabs current model docs say `eleven_v3` is the latest and most advanced speech synthesis model.
- The same docs say `eleven_turbo_v2_5` and `eleven_turbo_v2` are functionally equivalent to Flash equivalents except Flash has lower average latency, and recommend Flash over Turbo.
- Flash v2.5 has an important caveat: numbers are not normalized by default the way users may expect. For this app, normalize dates, money, phone numbers, and named entities in the translated English text before calling TTS, or use Multilingual v2 for cases where number pronunciation is critical.

Sources:

- [ElevenLabs models overview](https://elevenlabs.io/docs/overview/models)
- [ElevenLabs TTS API page](https://elevenlabs.io/text-to-speech-api)
- [Eleven v3 help article](https://help.elevenlabs.io/hc/en-us/articles/35869054119057-What-is-Eleven-v3)

## API Shape

Basic HTTP generation:

```http
POST https://api.elevenlabs.io/v1/text-to-speech/:voice_id?output_format=mp3_44100_128
xi-api-key: <server-side-api-key>
Content-Type: application/json

{
  "text": "English translation text goes here.",
  "model_id": "eleven_flash_v2_5",
  "language_code": "en",
  "voice_settings": {
    "stability": 0.5,
    "similarity_boost": 0.8,
    "speed": 1
  }
}
```

The response is the generated audio file bytes. `voice_id` is required and can come from account voices, cloned voices, voice design, or available voice-library voices depending on plan/account access.

Streaming HTTP generation:

```http
POST https://api.elevenlabs.io/v1/text-to-speech/:voice_id/stream?output_format=mp3_44100_128
xi-api-key: <server-side-api-key>
Content-Type: application/json

{
  "text": "English translation text goes here.",
  "model_id": "eleven_flash_v2_5",
  "language_code": "en"
}
```

Important request fields:

- `text`: required input text.
- `model_id`: optional, defaults to `eleven_multilingual_v2` if omitted. Set this explicitly.
- `language_code`: optional ISO 639-1 code; use `en` for English output.
- `output_format`: query parameter; default is `mp3_44100_128`.
- `voice_settings`: optional per-request overrides.
- `pronunciation_dictionary_locators`: optional, up to 3 dictionaries per request.
- `seed`: best-effort deterministic sampling, but determinism is not guaranteed.
- `previous_text`, `next_text`, `previous_request_ids`, `next_request_ids`: useful if splitting long text into chunks.
- `apply_text_normalization`: `auto`, `on`, or `off`; for Flash v2.5, forcing normalization on is documented as Enterprise-only in the model docs/WebSocket reference.
- `enable_logging=false`: documented zero-retention mode, but only Enterprise customers can use it.

Sources:

- [Create speech API reference](https://elevenlabs.io/docs/api-reference/text-to-speech/convert)
- [Stream speech API reference](https://elevenlabs.io/docs/api-reference/text-to-speech/stream)
- [List models API reference](https://elevenlabs.io/docs/api-reference/models/list)

## Voices And Language Support

ElevenLabs offers multiple voice paths:

- Voice Library: 3,000+ community-shared voices in docs; product marketing also says the broader library has 10,000+ voices.
- Cloned voices: Instant Voice Cloning and Professional Voice Cloning.
- Voice Design: generated voices from text descriptions.

Free-tier caveat: the text-to-speech capability docs say the Voice Library is not available via API to free-tier users. For a backend integration, this means a free account may be enough to test with accessible/default account voices, but provider evaluation should not assume all library voices are API-accessible without a paid plan.

Language support relevant to this app:

- English is supported across the current TTS models.
- Arabic is supported by Multilingual v2 and Flash v2.5 language sets, but this app's TTS use case is English speech after translation, not Darija speech synthesis.
- For natural English output, select an English voice/accent matching the target user experience.

Sources:

- [Text to Speech capability docs](https://elevenlabs.io/docs/overview/capabilities/text-to-speech)
- [Voice cloning overview](https://elevenlabs.io/docs/eleven-creative/voices/voice-cloning)
- [ElevenLabs TTS API page FAQ](https://elevenlabs.io/text-to-speech-api)

## Streaming, Latency, And Playback

Supported modes:

- Non-streaming HTTP: easiest for this app; generate the full file in Trigger.dev, upload to Supabase Storage, then expose playback metadata to the mobile client.
- HTTP streaming: returns raw audio bytes with chunked transfer encoding; useful if the server wants to pipe audio as it generates.
- WebSocket streaming: `wss://api.elevenlabs.io/v1/text-to-speech/:voice_id/stream-input`; useful when input text is itself streaming in chunks or word/audio alignment is needed.

Latency guidance:

- Flash v2.5: about 75 ms model latency, excluding application/network latency.
- Turbo v2.5: product page says about 250-300 ms, but current model docs recommend Flash over Turbo.
- Multilingual v2: higher latency/cost but higher quality.
- Eleven v3: newest/most expressive, but the help article says it has higher latency and more variable consistency and is not suited to real-time/conversational use.

For this app, the translation text is available after the async job completes, so WebSocket streaming adds complexity without much benefit. HTTP non-streaming or HTTP streaming is enough. If the UX later wants "play while final translation appears," the API can proxy stream chunks, but that should be a separate UX/API design because Expo audio playback, auth, retries, and storage semantics change.

Sources:

- [Streaming docs](https://elevenlabs.io/docs/api-reference/streaming)
- [Stream speech API reference](https://elevenlabs.io/docs/api-reference/text-to-speech/stream)
- [WebSocket API reference](https://elevenlabs.io/docs/api-reference/text-to-speech/v-1-text-to-speech-voice-id-stream-input)
- [Eleven v3 help article](https://help.elevenlabs.io/hc/en-us/articles/35869054119057-What-is-Eleven-v3)

## File Formats

Default output is MP3. Documented output formats include:

- MP3: 22.05 kHz to 44.1 kHz, 32 kbps to 192 kbps.
- PCM S16LE: 16 kHz to 44.1 kHz in capability docs; API reference notes higher-quality 44.1 kHz PCM/WAV requires Pro.
- u-law and A-law: 8 kHz telephony formats.
- Opus: 48 kHz, 32 kbps to 192 kbps.

Plan-gated quality:

- Default `mp3_44100_128` is the safest app default.
- MP3 192 kbps requires Creator tier or above.
- PCM/WAV 44.1 kHz requires Pro tier or above.

For Expo playback, MP3 is the pragmatic default. Store as `audio/mpeg` and avoid PCM unless a downstream feature needs raw samples or alignment tooling.

Sources:

- [Text to Speech capability docs](https://elevenlabs.io/docs/overview/capabilities/text-to-speech)
- [Create speech API reference](https://elevenlabs.io/docs/api-reference/text-to-speech/convert)

## Pricing And Affordability

Pricing is credit-based. ElevenLabs says credits were previously called characters. For TTS:

- Flash v2 and Flash v2.5 on self-serve plans: 1 text character = 0.5 credits.
- Other listed models such as Multilingual v2: 1 text character = 1 credit.
- Some shared Voice Library voices can apply a custom multiplier.
- Credits reset monthly; paid plans can roll unused credits for up to two months if the subscription stays active.

Published plan snapshot:

| Plan | Monthly price | Monthly credits | Relevant notes |
| --- | --- | --- | --- |
| Free | $0 | 10,000 | About 10 TTS minutes shown in pricing table; no commercial license; Voice Library not available via API to free users |
| Starter | $6 | 30,000 | Commercial license, Instant Voice Cloning |
| Creator | $11 first month promo shown, otherwise page headline shows $22 with first month 50% off | 121,000 | Professional Voice Cloning, additional credits |
| Pro | $99 | 600,000 | 44.1 kHz PCM API output and 192 kbps quality |
| Scale | $299 | 1,800,000 | 3 workspace seats, team collaboration, 3 professional voice clones |
| Business | $990 | 6,000,000 | Low-latency TTS as low as 5 cents/minute, 10 professional voice clones |
| Enterprise | Custom | Custom | Elevated concurrency, DPA/SLA terms, HIPAA BAA support, zero retention/EU residency options |

Affordability estimate for this app:

- A typical short translation of 500 English characters costs about 250 credits with `eleven_flash_v2_5`.
- The same text costs about 500 credits with `eleven_multilingual_v2`.
- On the 10,000-credit free tier, that rough pattern is about 40 short Flash generations or 20 Multilingual v2 generations before accounting for voice multipliers/regenerations.
- On Starter's 30,000 credits, it is about 120 short Flash generations or 60 Multilingual v2 generations.

Product-page per-minute positioning:

- Flash v2.5 and Turbo v2.5: about $0.06/minute.
- Multilingual v2 and Eleven v3: about $0.12/minute.
- Pricing tables also show extra UI TTS minutes around $0.36/min Free, $0.20/min Starter, and about $0.17-$0.18/min higher paid tiers. The API docs/pricing FAQ make clear actual API credit burn depends on model and plan, so use credit accounting rather than only minute estimates.

Conclusion: ElevenLabs can be affordable for occasional playback if `eleven_flash_v2_5` is used and audio is cached/stored per translation. It becomes expensive if every poll, retry, or screen open regenerates speech. The app should generate once per completed translation and persist the audio object URL/metadata.

Sources:

- [ElevenLabs pricing](https://elevenlabs.io/pricing)
- [What are credits?](https://help.elevenlabs.io/hc/en-us/articles/27562020846481-What-are-credits)
- [ElevenLabs TTS API page](https://elevenlabs.io/text-to-speech-api)

## Free Tier, Limits, And Concurrency

Documented free tier:

- 10,000 credits/month.
- Pricing table shows about 10 included TTS minutes.
- Free plan lacks commercial license.
- Voice Library is not available via API to free-tier users.

Documented request/concurrency constraints:

- Free plan concurrency: 2 for Multilingual v2, 4 for Flash, 8 for STT, 6 for realtime STT, 0 for Music.
- Starter: 3 Multilingual v2 / 6 Flash.
- Creator: 5 Multilingual v2 / 10 Flash.
- Pro: 10 Multilingual v2 / 20 Flash.
- Scale/Business: 15 Multilingual v2 / 30 Flash.
- Enterprise: elevated.
- Response headers include `current-concurrent-requests` and `maximum-concurrent-requests`.
- The docs emphasize concurrency, not requests per minute, as the more important scaling metric.

For this app, Trigger.dev should enforce provider-level concurrency and retry behavior. A single user generating one MP3 after each translation completion is low risk; batch backfills or repeated retries could hit credit/concurrency limits.

Sources:

- [ElevenLabs pricing](https://elevenlabs.io/pricing)
- [Models concurrency docs](https://elevenlabs.io/docs/overview/models)
- [Text to Speech capability docs](https://elevenlabs.io/docs/overview/capabilities/text-to-speech)

## Voice Cloning Limits And Policy Risk

Voice cloning options:

- Instant Voice Cloning (IVC): near-instant clone from shorter samples. The docs say it does not train a custom model and instead relies on prior model knowledge to infer a voice.
- Professional Voice Cloning (PVC): Creator+ feature that trains a dedicated voice model. Docs say fine-tuning generally takes 3-6 hours, depending on queue and other factors.

Pricing-plan cloning notes:

- Starter includes Instant Voice Cloning.
- Creator includes Professional Voice Cloning.
- Scale includes 3 Professional Voice Clones.
- Business includes 10 Professional Voice Clones.
- Enterprise can include more seats and voices.

App recommendation:

- Do not include voice cloning in the initial Darija-to-English TTS feature. It adds consent, identity, abuse, support, and storage obligations unrelated to English playback.
- If added later, require explicit user consent, keep clone management server-side, and document deletion/export behavior.

Sources:

- [Voice cloning overview](https://elevenlabs.io/docs/eleven-creative/voices/voice-cloning)
- [ElevenLabs pricing](https://elevenlabs.io/pricing)

## Backend Node/Express And Trigger.dev Integration Risks

Integration shape:

1. Keep `ELEVENLABS_API_KEY`, `ELEVENLABS_TTS_MODEL_ID`, `ELEVENLABS_VOICE_ID`, and `ELEVENLABS_OUTPUT_FORMAT` server-side in `.env.local` and deployment secrets.
2. After Trigger completes consolidation and English translation, call ElevenLabs from the Trigger job or a server-side job helper.
3. Use `POST /v1/text-to-speech/:voice_id` with `model_id: "eleven_flash_v2_5"`, `language_code: "en"`, and `output_format=mp3_44100_128`.
4. Upload returned audio bytes to private Supabase Storage, ideally under the translation job/user namespace.
5. Store audio metadata on the translation row: provider, model, voice ID/name, output format, storage bucket/key, byte size, generated timestamp, and error state.
6. API returns authenticated audio metadata or a short-lived signed URL to the Expo app.

Risks and mitigations:

- Secret exposure: never call ElevenLabs directly from Expo. The API key must stay in Node/Trigger.
- Duplicate generation: Trigger retries can burn credits. Make TTS idempotent by checking whether a translation already has a successful audio object before generating.
- Cost runaway: cap input characters, generate once, cache audio, and do not regenerate on every status poll.
- Latency: use Flash v2.5 for default playback. Do not block the translation success state on TTS unless product requires speech as part of completion.
- Number pronunciation: pre-normalize translated English text, especially dates, amounts, phone numbers, legal IDs, and mixed Arabic/French names.
- Data retention/privacy: `enable_logging=false` zero-retention mode is documented as Enterprise-only. Assume normal API calls may be retained per ElevenLabs account settings/terms unless Enterprise terms are in place.
- Plan-gated voice access: free tier cannot use Voice Library via API, so pick a voice available to the account and test with the actual deployment account.
- Format compatibility: use MP3 128 kbps unless a paid tier and feature require higher fidelity.
- Concurrency: free/Starter plans are enough for manual QA but may queue under parallel user load. Watch `current-concurrent-requests` and `maximum-concurrent-requests` response headers.
- Error handling: handle 401/403 for invalid key or plan/voice access, 422 for bad model/voice/request, 429 for concurrency/rate/credit pressure, and 5xx/timeouts with bounded retries.
- Commercial rights: Free plan does not include commercial license. A shipped app should use at least Starter if generated audio is part of a commercial product.

## Implementation Verdict

Recommended first implementation:

- Provider: ElevenLabs
- Model: `eleven_flash_v2_5`
- Voice: fixed account-owned English voice ID, configured server-side
- Format: `mp3_44100_128`
- Trigger timing: post-translation async add-on, not on the critical path for the text result
- Storage: private Supabase Storage, one generated audio file per translation result
- UI: show Play button only when `tts_audio_url` or authenticated audio endpoint is available

Do not use ElevenLabs for Darija input processing. Keep the existing ASR/consolidation/translation pipeline as-is and add TTS only after English translation completion.
