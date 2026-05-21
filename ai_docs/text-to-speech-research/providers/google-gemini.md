# Google Gemini TTS research

Research date: 2026-05-21

## Short recommendation

Gemini TTS is viable for English speech playback after the Darija-to-English translation completes, but it is not the cheapest Gemini TTS path if we insist on the newest model.

Use `gemini-3.1-flash-tts-preview` only if the product needs the newest Gemini TTS voice quality, expressive tags, and current Google model line. For affordability, keep `gemini-2.5-flash-preview-tts` as the fallback while Google still offers it: it is half the paid output price of 3.1 Flash TTS and still supports single-speaker and multi-speaker TTS.

Do not call Gemini from the Expo app. If adopted, run Gemini TTS in the existing backend/Trigger.dev pipeline after translation succeeds, store the generated audio server-side, and expose only app-safe result metadata or signed playback URLs.

## Current Gemini TTS models

Google's current TTS guide lists three Gemini TTS models as supported for both single-speaker and multi-speaker generation:

| Model | Model code | Current role for this app | Notes |
| --- | --- | --- | --- |
| Gemini 3.1 Flash TTS Preview | `gemini-3.1-flash-tts-preview` | Primary current/newest candidate | Latest dedicated Gemini TTS model. Google describes it as low-latency speech generation with natural outputs, steerable prompts, expressive audio tags, and improved multilinguality. Latest update: April 2026. |
| Gemini 2.5 Flash Preview TTS | `gemini-2.5-flash-preview-tts` | Lower-cost fallback | Older than 3.1, but still documented as supported. Google positions it as fast, cost-efficient, low-latency TTS. Latest update: December 2025. |
| Gemini 2.5 Pro Preview TTS | `gemini-2.5-pro-preview-tts` | Quality fallback only | Same paid output price as 3.1 Flash TTS, but older. Google positions it for long-form/professional narration and highest vocal clarity. |

Sources: [Gemini TTS guide](https://ai.google.dev/gemini-api/docs/speech-generation), [Gemini 3.1 Flash TTS model page](https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-tts-preview), [Gemini 2.5 Flash TTS model page](https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash-preview-tts), [Gemini 2.5 Pro TTS model page](https://ai.google.dev/gemini-api/docs/models/gemini-2.5-pro-preview-tts).

## API shape

Gemini TTS uses the Gemini `generateContent` API with audio response modality and a speech config.

Node/JavaScript shape:

```ts
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const response = await ai.models.generateContent({
  model: "gemini-3.1-flash-tts-preview",
  contents: [{ parts: [{ text: "Read in a warm, clear voice: Your translation is ready." }] }],
  config: {
    responseModalities: ["AUDIO"],
    speechConfig: {
      voiceConfig: {
        prebuiltVoiceConfig: { voiceName: "Kore" },
      },
    },
  },
});

const base64Pcm = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
```

The official examples decode the returned inline audio data to PCM and then wrap/transcode it. Their Node example writes a WAV file with 1 channel, 24 kHz sample rate, and 16-bit depth; the REST example decodes to `out.pcm` and uses `ffmpeg -f s16le -ar 24000 -ac 1` to create WAV.

For this app, store a mobile-friendly file, not raw PCM. The safest backend output path is:

1. Generate PCM from Gemini in the Trigger.dev job.
2. Wrap as WAV immediately for lossless debugging.
3. Optionally transcode to AAC/M4A or MP3 if Expo playback/storage size becomes a concern.
4. Upload to private Supabase Storage and return a signed URL or server-mediated playback endpoint.

Sources: [Gemini TTS JavaScript and REST examples](https://ai.google.dev/gemini-api/docs/speech-generation).

## Voices and language support

Gemini TTS currently exposes 30 prebuilt voices:

`Zephyr`, `Puck`, `Charon`, `Kore`, `Fenrir`, `Leda`, `Orus`, `Aoede`, `Callirrhoe`, `Autonoe`, `Enceladus`, `Iapetus`, `Umbriel`, `Algieba`, `Despina`, `Erinome`, `Algenib`, `Rasalgethi`, `Laomedeia`, `Achernar`, `Alnilam`, `Schedar`, `Gacrux`, `Pulcherrima`, `Achird`, `Zubenelgenubi`, `Vindemiatrix`, `Sadachbia`, `Sadaltager`, and `Sulafat`.

For an English translation playback feature, use an English voice prompt and choose a neutral voice such as `Kore`, `Charon`, `Iapetus`, `Achird`, or `Sulafat` during QA. The app does not need Gemini to speak Moroccan Darija for the first feature because the generated audio should read the English translation.

Language support is broad and auto-detected. The current TTS guide lists English (`en`), Arabic (`ar`), French (`fr`), Spanish (`es`), and many others. It does not document Moroccan Arabic/Darija as a distinct language or dialect target. If a future feature reads the source Darija aloud, this provider needs separate voice-quality QA rather than assuming Arabic support covers Moroccan Darija naturally.

Sources: [Gemini TTS voice options and supported languages](https://ai.google.dev/gemini-api/docs/speech-generation).

## Streaming and latency

Dedicated Gemini TTS is designed for low-latency generation, but it is still a `generateContent` audio generation request that returns generated audio data. The model pages mark Live API as not supported for the dedicated TTS models.

For true bidirectional streaming audio, Google points to the Gemini Live API, not the dedicated TTS endpoint. Live API is built for real-time voice/video interactions over WebSockets/WebRTC and returns raw 24 kHz PCM audio, but it is a different product shape and not a good first fit for this app's post-translation "read the completed English translation" workflow.

Practical implication:

- For this app's async translation jobs, dedicated Gemini TTS fits: generate one audio asset after translation succeeds.
- For tap-to-listen immediately after completion, expect the first playback to wait for generation unless the Trigger job pre-generates TTS.
- For live conversational voice, evaluate Gemini Live separately; it brings session duration limits, streaming infrastructure, and different auth risks.

Sources: [Gemini TTS guide](https://ai.google.dev/gemini-api/docs/speech-generation), [Gemini 3.1 Flash TTS model capabilities](https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-tts-preview), [Gemini Live API capabilities](https://ai.google.dev/gemini-api/docs/live-guide).

## Pricing and affordability

Google prices Gemini TTS by input text tokens and output audio tokens. The pricing page states that audio tokens correspond to 25 tokens per second of audio.

| Model | Free tier | Paid standard input | Paid standard output | Batch pricing | Approx paid output cost per 60 sec |
| --- | --- | --- | --- | --- | --- |
| `gemini-3.1-flash-tts-preview` | Input/output free of charge on free tier | $1.00 / 1M text tokens | $20.00 / 1M audio tokens | $0.50 input, $10.00 output per 1M tokens | $0.03/min standard, $0.015/min batch |
| `gemini-2.5-flash-preview-tts` | Input/output free of charge on free tier | $0.50 / 1M text tokens | $10.00 / 1M audio tokens | $0.25 input, $5.00 output per 1M tokens | $0.015/min standard, $0.0075/min batch |
| `gemini-2.5-pro-preview-tts` | No free tier documented | $1.00 / 1M text tokens | $20.00 / 1M audio tokens | $0.50 input, $10.00 output per 1M tokens | $0.03/min standard, $0.015/min batch |

For this app's likely usage, input token cost is negligible compared with audio output. A one-minute English reading at 25 audio tokens/sec is about 1,500 output audio tokens. At standard paid rates:

- Gemini 3.1 Flash TTS: 1,500 / 1,000,000 * $20 = about $0.03.
- Gemini 2.5 Flash TTS: 1,500 / 1,000,000 * $10 = about $0.015.

Affordability conclusion:

- `gemini-2.5-flash-preview-tts` is the better cost pick if Google keeps it available and its quality is acceptable.
- `gemini-3.1-flash-tts-preview` is the current/newest pick, but it doubles the output cost versus 2.5 Flash TTS.
- Batch is cheaper, but only useful if we can tolerate delayed generation. For user-facing "translation completed, press play" behavior, standard generation is simpler.

Sources: [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing).

## Free tier and rate limits

The pricing page documents free-tier availability for `gemini-3.1-flash-tts-preview` and `gemini-2.5-flash-preview-tts`: input and output are listed as free of charge on the free tier. `gemini-2.5-pro-preview-tts` does not list free-tier availability.

The public rate-limit page does not currently publish fixed RPM/RPD numbers for the TTS models in the static docs. It says rate limits vary by usage tier and model, are more restrictive for preview models, apply per project rather than per API key, and should be checked in Google AI Studio. It also documents batch enqueued-token limits for 2.5 TTS models:

| Model | Tier 1 batch enqueued tokens | Tier 2 | Tier 3 |
| --- | ---: | ---: | ---: |
| Gemini 2.5 Flash TTS | 100,000 | 100,000 | 4,000,000 |
| Gemini 2.5 Pro TTS | 25,000 | 100,000 | 1,000,000 |

The rate-limit page I found does not list batch enqueued-token rows for `gemini-3.1-flash-tts-preview`, even though the 3.1 model page says Batch API is supported. Treat that as an integration risk until verified inside the linked Google AI Studio project.

Sources: [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing), [Gemini API rate limits](https://ai.google.dev/gemini-api/docs/rate-limits).

## Integration fit for this Expo app

Recommended integration point:

1. Keep mobile unchanged for provider calls: the Expo app continues to send authenticated audio to the Node/Express API and poll translation status.
2. Add optional TTS generation after the English translation is finalized in the Trigger.dev job, not before.
3. Store generated audio in private Supabase Storage under the translation row.
4. Extend the translation response with fields such as `tts_audio_url`, `tts_provider`, `tts_model`, `tts_voice`, `tts_format`, `tts_duration_seconds`, and `tts_status`.
5. Let the mobile app render a play button only when `tts_status === "succeeded"`.

Backend dependencies:

- `@google/genai` for Gemini API calls.
- A small WAV writer or `ffmpeg` path for wrapping/transcoding PCM.
- A new server-side secret such as `GEMINI_API_KEY`; never expose it through `EXPO_PUBLIC_*`.

Operational risks:

- Preview model instability: all current Gemini TTS options here are preview models. Google warns preview models may change before stable release and may have more restrictive rate limits.
- Rate-limit uncertainty: current RPM/RPD must be checked in AI Studio for the actual project. Build retries/backoff and do not block translation completion on TTS failure.
- Data-use boundary: Google pricing tables show free-tier usage is used to improve products, while paid-tier usage is not. For user audio/translations, prefer paid tier before shipping.
- Output processing: Gemini returns generated audio data that the backend must decode and package. Expo should not receive raw PCM unless we have a tested playback path.
- Latency: if generated after translation completion, the user may wait for speech. If generated inside the Trigger job before marking the translation fully complete, the app's completion state waits longer.
- Idempotency: retries from Trigger.dev can duplicate audio generation and storage writes. Key TTS output by translation ID, model, voice, and text hash.
- Cost creep: TTS is cheap per minute but can become meaningful if every translation auto-generates audio. Add a feature flag or generate-on-demand mode for early QA.
- Voice QA: English is supported, but voice choice and prompt style need device QA with real translation text to avoid unnatural pacing or over-acted delivery.

## Fallback comparison: Google Cloud TTS

Google Cloud Text-to-Speech is not the focus here. It may still be useful later if the app needs a stable GA product, SSML-heavy controls, broader production SLA expectations, or established audio encodings without Gemini preview churn. For the current research question, Gemini TTS is the better-aligned candidate because it is the newest Google AI TTS path and supports natural-language controllability.

## Decision

For an MVP English "listen to translation" feature:

1. Prototype with `gemini-3.1-flash-tts-preview` because it is the newest/current Gemini TTS model as of this research date.
2. Also run the same fixture through `gemini-2.5-flash-preview-tts` because it is materially cheaper and may be good enough.
3. Do not use Gemini Live API for this workflow unless the product shifts from post-translation playback to real-time voice interaction.
4. Do not ship on free tier if translation text/audio privacy matters; move to paid billing and verify rate limits in AI Studio first.
