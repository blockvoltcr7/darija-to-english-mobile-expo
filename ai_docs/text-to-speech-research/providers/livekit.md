# LiveKit TTS / Voice Research

Research date: 2026-05-21

## Bottom line for this app

LiveKit is best treated as a realtime voice-agent and media-transport platform, not as the cheapest way to add "play spoken English after translation completes." For the current Darija-to-English architecture, where the mobile app uploads audio, the Express API stores it, Trigger.dev completes STT/consolidation/translation, and the app polls for a completed result, direct server-side TTS generation is the better first implementation.

Use LiveKit later if the product moves from async translation playback into realtime conversation, live interpretation, interruption/barge-in, WebRTC voice rooms, or phone-call workflows. LiveKit's current feature set is strong for those cases, but it introduces agent sessions, LiveKit credentials, mobile native WebRTC setup, inference billing, and possibly telephony charges that are not needed for simple post-translation audio playback.

## What LiveKit provides

LiveKit Agents is an open-source Python and Node.js framework for realtime, programmable participants that can hear, speak, use tools, and join LiveKit rooms. The current Node.js docs describe a 1.0 release with provider plugins for STT, LLM, TTS, and realtime APIs, WebRTC clients across platforms, RPC/data APIs, semantic turn detection, and self-hostable LiveKit server support. LiveKit's own simple Node voice-agent example uses `AgentSession` with STT, LLM, TTS, VAD, and turn detection, and notes that no third-party API keys are required when using LiveKit Inference Gateway. Source: [LiveKit Agents for Node.js](https://docs.livekit.io/reference/agents-js/).

LiveKit Inference is LiveKit Cloud's unified model gateway for LLM, STT, and TTS models. It provides access to providers such as OpenAI, Google, AssemblyAI, Deepgram, Cartesia, ElevenLabs, and others through one LiveKit account/API key. In the current docs, `inference.TTS` is configured inside an `AgentSession`, for example with a Cartesia Sonic voice. Source: [LiveKit Inference docs](https://docs.livekit.io/agents/models/inference/).

For Expo, LiveKit provides a React Native SDK and Expo config plugin, but it is not compatible with Expo Go because native WebRTC code is required. A development build/dev client is required. Source: [LiveKit Expo quickstart](https://docs.livekit.io/transport/sdk-platforms/expo/).

## What LiveKit does not provide

LiveKit does not appear to be a first-party TTS model provider in the same sense as OpenAI, ElevenLabs, Cartesia, Deepgram, or Rime. LiveKit provides:

- A realtime media layer and rooms.
- Agent orchestration.
- Hosted inference access/billing through LiveKit Inference.
- Open-source provider plugins if you want to bring your own provider account.
- Turn detection, VAD integration, observability, and telephony primitives.

The TTS voices/models listed in LiveKit docs are provider models surfaced through LiveKit Inference or provider plugins. That means the synthesis quality, model capability, language support, and base economics come from the underlying TTS provider, with LiveKit adding orchestration, realtime delivery, unified billing, and operational tooling.

## Current TTS model surface

LiveKit's TTS docs list two paths:

- LiveKit Inference: provider models hosted behind LiveKit Cloud, no separate provider API key required.
- Plugins: open-source plugins for provider-specific access when you want direct billing/rate-limit control or a provider/model not available through LiveKit Inference.

Current LiveKit Inference TTS providers/models include:

| Provider | Relevant models | Notes |
| --- | --- | --- |
| Cartesia | Sonic 2, Sonic 3, Sonic 3 dated releases, Sonic 3 Latest, Sonic Turbo | Broad multilingual support. Sonic 3 includes English and many other languages. |
| Deepgram | Aura-2 | English variants plus Spanish, Dutch, French, German, Italian, Japanese. |
| ElevenLabs | Flash v2/v2.5, Multilingual v2, Turbo v2/v2.5, v3 | Strong voice quality, but higher LiveKit Inference pricing than Cartesia/Deepgram. |
| Inworld | Realtime TTS 1.5/2.0 variants | Realtime voice-agent oriented TTS. |
| Rime | Arcana, Coda, Mist, Mist v2, Mist v3 | Conversation-oriented voices; Mist tiers are lower-priced in LiveKit Inference. |
| xAI | Text to Speech | Very low LiveKit Inference per-character price in the current table. |

LiveKit's plugin table is broader than LiveKit Inference. It includes Python and/or Node.js plugins for providers such as Cartesia, Deepgram, ElevenLabs, Inworld, Mistral AI, Neuphonic, OpenAI, Resemble AI, Rime, Sarvam, and others. Source: [LiveKit TTS models overview](https://docs.livekit.io/agents/models/tts/).

## Realtime voice pipeline options

LiveKit currently presents three voice pipeline types:

| Pipeline | What it is | Fit for this app |
| --- | --- | --- |
| STT-LLM-TTS | Separate speech recognition, language model, and speech synthesis models. | Best LiveKit default for production voice agents, but duplicates this app's existing STT/translation flow if used only after a completed translation. |
| Realtime model | A speech-to-speech model consumes and produces audio directly. | Useful for live conversational translation or voice assistant modes, not ideal for deterministic "speak this exact translated text" playback. |
| Half-cascade | Realtime input understanding with separate TTS output. | Useful if later versions need realtime understanding plus controlled spoken output. |

LiveKit says most production agents should default to STT-LLM-TTS. It also notes that realtime models are fastest but have less mature tool calling, delayed transcription, limited text auditability, and no precise scripted speech via `say()`. For this app, exact playback of a completed English translation is closer to scripted TTS than realtime speech-to-speech. Source: [LiveKit pipeline types](https://docs.livekit.io/agents/models/pipelines/) and [LiveKit realtime models](https://docs.livekit.io/agents/models/realtime/).

## Turn detection and interruption handling

LiveKit's turn-detection stack matters for interactive voice, not for simple playback after a completed translation. Current docs describe:

- Silero VAD for voice activity detection.
- LiveKit's open-weights multilingual turn detector, which adds conversational context on top of VAD.
- Recommended use of the LiveKit turn detector plus Silero VAD in STT-LLM-TTS pipelines.
- For realtime models, LiveKit recommends using the model provider's built-in turn detection where possible because using the LiveKit turn detector with a realtime model requires a separate STT model.

The LiveKit turn detector is designed for `AgentSession`, requires an STT model, runs globally on LiveKit Cloud for Cloud-deployed agents, and for custom deployments runs locally on CPU with less than 500 MB RAM. Source: [Turns overview](https://docs.livekit.io/agents/logic/turns/) and [LiveKit turn detector plugin](https://docs.livekit.io/agents/logic/turns/turn-detector/).

## Telephony

LiveKit telephony is a major reason to choose LiveKit if the product becomes call-based. It supports LiveKit Phone Numbers, third-party SIP trunks, inbound calls, outbound calls, dispatch rules, SIP participants, DTMF, transfers, secure trunks, and noise cancellation for calls. Outbound calls are made by creating a SIP participant tied to an outbound trunk, which connects the callee into a LiveKit room where agents or other participants can interact. Source: [LiveKit telephony overview](https://docs.livekit.io/telephony/) and [Make outbound calls](https://docs.livekit.io/telephony/making-calls/outbound-calls/).

Telephony is not relevant to the first "speak completed translation in the mobile app" feature unless the product roadmap includes phone-call translation or voice-agent calls.

## Pricing snapshot

LiveKit Cloud pricing, current as of this research:

- Build: $0/month.
- Ship: $50/month.
- Scale: $500/month.
- Agent session minutes: Build includes 1,000/month; Ship includes 5,000/month then $0.01/min; Scale includes 50,000/month then $0.01/min.
- Agent concurrency: Build 5, Ship 20, Scale up to 600.
- WebRTC participant minutes: Build includes 5,000; Ship includes 150,000 then $0.0005/min; Scale includes 1.5M then $0.0004/min.
- Inference credits: Build $2.50, Ship $5, Scale $50, with additional usage billed by model prices.
- Telephony: one US local number included; US local inbound minutes are 50 Build, 100 Ship then $0.01/min, 1,000 Scale then $0.01/min; third-party SIP minutes are included up to plan limits, then $0.004/min on Ship and $0.003/min on Scale.

Source: [LiveKit pricing](https://livekit.com/pricing).

LiveKit Inference TTS is billed by characters. Current TTS rates per 1M characters:

| Provider/model family | Build/Ship | Scale |
| --- | ---: | ---: |
| Cartesia Sonic 3 / Sonic Turbo | $50.00 | $37.50 |
| Deepgram Aura-2 | $30.00 | $27.00 |
| ElevenLabs Flash / Turbo | $150.00 | $60.00 |
| ElevenLabs Multilingual v2 / v3 | $300.00 | $120.00 |
| Inworld Realtime TTS 1.5 Mini | $25.00 | $20.00 |
| Inworld Realtime TTS 2.0 | $35.00 | $30.00 |
| Rime Mist / Mist v2 / Mist v3 | $30.00 | $20.00 |
| Rime Coda | $50.00 | $50.00 |
| xAI Text to Speech | $4.20 | $4.20 |

Source: [LiveKit Inference pricing](https://livekit.com/pricing/inference).

## Direct TTS API comparison

Direct TTS generation fits the current Darija app better:

- The backend already owns provider keys and paid calls.
- Trigger.dev already performs async translation work after the mobile upload.
- The app already polls `/v1/translations/:id` for completion.
- A TTS step can be added after translation, store an audio artifact in private Supabase Storage, and return a signed URL or server-mediated playback URL.
- No realtime room, participant token, LiveKit agent worker, WebRTC audio session, turn detector, or telephony state is required.

OpenAI remains a natural direct-provider candidate because the app already uses OpenAI server-side. OpenAI's current docs expose a speech endpoint for text-to-speech and list current realtime/audio pricing separately from ChatGPT subscriptions. Sources: [OpenAI text-to-speech guide](https://platform.openai.com/docs/guides/text-to-speech/quickstart) and [OpenAI API pricing](https://openai.com/api/pricing/).

LiveKit can still be used to call OpenAI TTS through a plugin or through LiveKit Inference, but doing so for non-realtime playback adds another platform layer without solving a current hard problem.

## Architecture fit

Recommended first implementation:

1. Add a server-side TTS provider abstraction after the English translation is saved.
2. Generate one audio file per completed translation in Trigger.dev or in a follow-up server job.
3. Store the file in private Supabase Storage, likely under a `translation-artifacts` path keyed by `translation_id`.
4. Persist TTS provider/model/voice metadata beside existing translation result metadata.
5. Return playback metadata through `/v1/translations/:id`.
6. Let the Expo app play the stored audio with the existing authenticated result flow.

LiveKit implementation to defer:

1. Add LiveKit Cloud project credentials.
2. Add server endpoint to mint LiveKit participant tokens.
3. Add native LiveKit Expo SDK/config plugins and require a dev-client/native build.
4. Run a LiveKit agent worker alongside the API/Trigger runtime.
5. Choose LiveKit Inference or provider plugins for STT/LLM/TTS.
6. Join users into rooms and stream generated speech over WebRTC.

That deferred path is justified only for realtime conversation, live voice translation, call center/telephony use cases, or agentic voice interaction where turn detection and interruption handling are product requirements.

## Recommendation

Do not choose LiveKit for the first spoken-English playback feature. Choose direct TTS API generation from the existing server/Trigger.dev pipeline.

Revisit LiveKit when one of these becomes true:

- The app needs realtime voice chat rather than completed translation playback.
- Users should interrupt or barge into spoken output.
- The app needs phone-call translation, inbound/outbound voice agents, or SIP.
- The product needs WebRTC rooms with agent participants.
- Unified LiveKit observability and model routing are worth the added platform layer.

Best LiveKit fit if revisited: LiveKit Agents with a Node.js `AgentSession`, LiveKit Inference for fast prototyping, and provider plugins/direct accounts once cost or provider-specific controls matter.
