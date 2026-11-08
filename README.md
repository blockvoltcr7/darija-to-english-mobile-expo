# Darija to English Mobile

Record or upload Moroccan Darija audio, read an English translation, and record an English reply to get Moroccan Darija text and optional spoken audio.

The app runs on Expo and React Native. An authenticated Express API accepts audio and queues Trigger.dev jobs; workers call the AI providers and store results in Convex. Provider credentials stay on the server and worker.

**Start here:** [Visual codebase guide](ai_docs/html-visuals/codebase-guide/index.html) · [Setup](#local-development) · [Technology stack](#technology-stack) · [API](#api-surface) · [Source map](#repository-map)

## What you can do

| Task | Input | Result |
| --- | --- | --- |
| **Understand** | Record Darija or choose an audio file | Consolidated Darija transcript, English translation, both raw STT transcripts, model metadata, and optional English audio |
| **Reply** | Record an English response | English transcript, Moroccan Darija reply text, and optional Arabic/Darija audio for playback and sharing |
| **History** | Explicitly save an output | Reopen saved translations and replies for the signed-in user |
| **Account** | Clerk account | Profile, sign-out, consent controls, account deletion, and subscription actions |

Reply processes the new English recording on its own; the app does not send the earlier translation or conversation as context. Generated speech is optional and depends on the worker configuration.

## Visual walkthrough

The five diagrams below were created with Archify. Open the [guide](ai_docs/html-visuals/codebase-guide/index.html) locally for interactive diagrams with source references, theme controls, and export options. GitHub displays the SVG previews; download or clone the repo to open the HTML viewers.

| Diagram | What it explains |
| --- | --- |
| [Runtime architecture](ai_docs/html-visuals/codebase-guide/architecture.html) | What the app, API, worker, identity provider, database, and AI providers each own |
| [User journey](ai_docs/html-visuals/codebase-guide/user-flow.html) | Sign-in and consent, Understand versus Reply, playback, sharing, and saving |
| [Async request sequence](ai_docs/html-visuals/codebase-guide/async-jobs.html) | Upload, job dispatch, worker execution, and authenticated polling |
| [Understand pipeline](ai_docs/html-visuals/codebase-guide/understand-pipeline.html) | Parallel transcription, consolidation, English translation, and optional speech |
| [Reply pipeline](ai_docs/html-visuals/codebase-guide/reply-pipeline.html) | English speech to Moroccan Darija text and optional audio |

Diagram source references are pinned to core commit `8eb1b12`. The README also describes the current checkout's uncommitted RevenueCat integration in [Subscriptions](#subscriptions); that extension is outside the pinned diagrams. These documents explain source behavior and do not certify a deployed environment.

### Runtime architecture

![Core runtime architecture: Expo client, Clerk, Express API, Trigger.dev worker, Convex, OpenAI, and Modal](ai_docs/html-visuals/codebase-guide/architecture.svg)

The mobile app owns recording, file selection, display, and playback. The API owns authentication, consent, request validation, job submission, history, and private audio access. The worker owns provider calls and result persistence. Convex holds job state, text results, operation records, and audio artifacts.

Clerk supplies the user's identity. The app configures `ConvexProviderWithClerk`, but the translation and history screens currently use the Express API and REST polling. Server and worker calls to Convex use functions guarded by `CONVEX_SERVER_SECRET`.

### User journey

![User flow from email-code sign-in and consent to Understand or Reply, results, optional history, and sharing](ai_docs/html-visuals/codebase-guide/user-flow.svg)

1. Sign in or create an account using an email code.
2. Accept current AI processing and privacy terms when prompted.
3. Choose **Understand** to record/upload Darija, or **Reply** to record English.
4. Wait for the queued job; read the text as soon as it is stored.
5. Play generated audio when available, share reply audio, or explicitly save outputs to history.

### Understand pipeline

![Darija audio feeds OpenAI and Modal transcription in parallel, then consolidation, English translation, stored text, and optional TTS](ai_docs/html-visuals/codebase-guide/understand-pipeline.svg)

The worker sends the same audio to OpenAI STT and the Modal Darija ASR endpoint concurrently. **Both must succeed with nonempty transcripts.** OpenAI then reconciles the two hypotheses into one Arabic/Darija transcript, and a separate OpenAI call translates that transcript into English.

Raw transcripts, consolidated Darija, English, and model metadata are written before optional English TTS. A speech-generation failure records an artifact failure without discarding the text result. The orchestration lives in [server/translation-pipeline.mjs](server/translation-pipeline.mjs).

### Reply pipeline

![English recording becomes English text, Moroccan Darija reply text, stored results, and optional Arabic TTS audio](ai_docs/html-visuals/codebase-guide/reply-pipeline.svg)

Reply uses OpenAI for English transcription, Moroccan Darija text generation, and optional Arabic/Darija TTS. It runs as a separate Trigger task and does not use Modal or dual-transcript consolidation. Playback and sharing fetch generated audio through authenticated API routes.

### Async request sequence

![Sequence of mobile submission, API validation, Convex storage, Trigger dispatch, provider processing, and mobile polling](ai_docs/html-visuals/codebase-guide/async-jobs.svg)

The API responds with **HTTP 202**, a `jobId`, and a `triggerRunId` after dispatch. The app polls with refreshed Clerk tokens every 2.5 seconds, for up to 420 seconds per polling attempt. Trigger tasks allow up to 900 seconds and configure two attempts; automatic retries are disabled in local Trigger development.

The client can display stored text while the job is still running optional TTS, then continue fetching the audio state. UI `Complete` therefore does not always mean the worker has finished. A client polling timeout also does not establish that the background job failed; the screen can resume polling an existing queued job while its state remains available in the current session.

## Technology stack

Versions below are declared in [package.json](package.json), rather than a claim about a deployed build.

| Technology | Declared version | Role in this project |
| --- | --- | --- |
| Expo | `~55.0.26` | Native development builds, audio/file APIs, app configuration, and updates |
| React Native / React | `0.83.6` / `19.2.0` | Shared mobile UI and component state |
| TypeScript | `~5.9.2` | App/client contracts and Convex functions; API/worker modules use JavaScript `.mjs` |
| Expo Router | `~55.0.16` | File-based screens and protected navigation |
| Clerk | Expo `3.2.8` | Email-code authentication, mobile session token cache, API verification, and Convex identity |
| Node.js / Express | Docker: Node 22 / Express `^5.1.0` | HTTP API and protected access to jobs and artifacts |
| Trigger.dev | SDK `4.4.6` | Background tasks with run IDs, execution limits, and retry configuration |
| Convex | `^1.38.0` | Database functions, job ownership, private file storage, and scheduled cleanup |
| OpenAI SDK | `^6.9.1` | Transcription, transcript consolidation, translation, and optional TTS |
| Modal | External HTTP ASR endpoint | Second speech-to-text hypothesis tuned for Darija |
| RevenueCat | Purchases/UI `^10.2.0` | Current iOS subscription/paywall integration and purchase restoration |
| Zod | `4.4.3` | Trigger payload validation |

`expo-audio` handles recording and playback; `expo-document-picker` selects uploads; Expo FileSystem reads audio and caches downloads. Expo SecureStore supports Clerk's token cache. EAS profiles define native build environments, while the [Dockerfile](Dockerfile) packages the API separately.

### Model defaults

These are configurable defaults from [server/env.mjs](server/env.mjs), not hard-coded vendor requirements.

| Operation | Default |
| --- | --- |
| OpenAI STT | `gpt-4o-mini-transcribe` |
| Consolidation | `gpt-5.5` |
| English translation / Darija reply text | `gpt-5.5` |
| English and Arabic/Darija TTS | `gpt-4o-mini-tts`, voice `cedar` |
| English audio format | AAC |
| Reply audio format | MP3 |

## Local development

### Prerequisites

- Node.js 22 is the API container baseline; npm is the project's package manager.
- Xcode and an iOS Simulator, or Android Studio and an emulator, for native development.
- Configured Clerk, Convex, Trigger.dev, OpenAI, and Modal Darija ASR accounts/endpoints.
- An Expo **development build** for the complete native auth and audio experience.

### 1. Install and configure

```bash
npm install
cp .env.example .env
```

Replace the example placeholders. The API loads `.env.local` before `.env`; Trigger's configuration also merges `.env`, `.env.local`, and process environment values. Existing process values take precedence.

| Scope | Configuration |
| --- | --- |
| Mobile API target | `EXPO_PUBLIC_API_BASE_URL` |
| Mobile identity/data | `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`, `EXPO_PUBLIC_CONVEX_URL`; the example also provides `EXPO_PUBLIC_CONVEX_SITE_URL` |
| API Clerk auth | `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` |
| Convex deployment | `CONVEX_URL` (or `EXPO_PUBLIC_CONVEX_URL`), `CONVEX_SERVER_SECRET` |
| Convex JWT auth | Set `CLERK_JWT_ISSUER_DOMAIN` in the Convex deployment; configure Clerk's `convex` JWT template/audience |
| AI providers | `OPENAI_API_KEY`, `DARIJA_ASR_BASE_URL` (or `DARIJA_ASR_URL`), `DARIJA_ASR_API_KEY` |
| Background dispatch | `TRIGGER_PROJECT_REF`, `TRIGGER_SECRET_KEY`, `TRIGGER_ENVIRONMENT` |
| Optional integration hooks | `CLERK_WEBHOOK_SIGNING_SECRET`, RevenueCat configuration, `RETENTION_CLEANUP_SECRET` |

Use the same `CONVEX_SERVER_SECRET` in the API/worker environment and Convex deployment environment. Start `npx convex dev` to configure your development deployment and sync the schema/functions; use the deployment URL returned for your own project rather than assuming the example deployment belongs to you.

All `EXPO_PUBLIC_*` values are visible in the app bundle. Keep Clerk secret keys, the Convex server secret, Trigger secret key, and OpenAI/Modal credentials in server or worker configuration.

### 2. Choose the API address

| App target | `EXPO_PUBLIC_API_BASE_URL` |
| --- | --- |
| iOS Simulator | `http://localhost:8787` |
| Android emulator | `http://10.0.2.2:8787` |
| Physical device on the same Wi-Fi | `http://<mac-lan-ip>:8787` |
| Hosted native build | Your configured HTTPS API URL |

A phone's `localhost` refers to the phone. Restart Metro after changing public environment values.

### 3. Start the API, worker, and app

Use separate terminals from the repository root:

```bash
# Terminal 1: Express API
npm run api

# Terminal 2: Trigger.dev development worker
npm run trigger:dev

# Terminal 3: build and launch the native app
npm run ios
# or: npm run android
```

Keep `npx convex dev` running in another terminal when iterating on Convex functions. After the native development build is installed, `npm run start` starts Metro with the development client. For a device on your LAN, use `npx expo start --dev-client --lan --clear`.

To enable both generated-audio paths, start the API and worker with the same flags:

```bash
ENABLE_TTS=true ENABLE_RESPONSE_TTS=true npm run api
ENABLE_TTS=true ENABLE_RESPONSE_TTS=true npm run trigger:dev
```

Both flags are explicitly `false` in `.env.example`. If `ENABLE_RESPONSE_TTS` is omitted entirely, it inherits `ENABLE_TTS`; an explicit `false` overrides that fallback.

### 4. Check configuration and exercise a flow

```bash
curl http://localhost:8787/health
curl http://localhost:8787/health/convex
```

`/health` reports configuration flags and model names; it does not call the AI providers or prove the worker is running. `/health/convex` performs a database connectivity query. To exercise the app, sign in, accept consent, submit a non-sensitive audio fixture, and correlate `jobId` and `triggerRunId` across the UI, API, and Trigger logs.

The [iOS Simulator file helper](.agents/skills/ios-simulator-files/SKILL.md) can load an audio fixture into Files for upload testing. The full fresh-user acceptance path is in [AGENTS.md](AGENTS.md#fresh-clerk-user-qa).

## Data, access, and retention

| Data | Convex location | Purpose |
| --- | --- | --- |
| User profile | `profiles` | Clerk identity mapping |
| Consent/preferences | `userConsents`, `privacyPreferences` | Versioned processing consent and history preference |
| Work state | `translationJobs` | Owner, status, trace/run IDs, retention, and source audio metadata |
| Text output | `translationResults` | Raw transcripts, consolidated Darija, English, and model metadata |
| Provider evidence | `providerRuns` | Operation/model, status, latency, and safe diagnostic metadata |
| Generated speech | `translationArtifacts` + private storage | Audio state, voice/format, storage reference, and input hash |
| Subscription state | RevenueCat customer/entitlement/event and usage tables | Current checkout's billing and quota extension |

The [schema](convex/schema.ts) defines the data model. Most server-owned Convex functions require the shared server secret and receive the Clerk user ID from the verified API identity. Audio API responses expose authenticated playback routes rather than private storage IDs or generated storage URLs.

Outputs are unsaved by default; the normal ephemeral retention window is 24 hours. The worker attempts to delete original audio after downloading it. Convex schedules expired-content cleanup hourly, so expiry is a cleanup eligibility time rather than a guarantee of deletion at the exact second. Explicitly saved outputs are retained for history until removed through the app's data lifecycle. See [convex/crons.ts](convex/crons.ts), [convex/translations.ts](convex/translations.ts), and [server/account-deletion.mjs](server/account-deletion.mjs).

## Subscriptions

The current working tree adds RevenueCat purchases, paywalls, and restore actions on **iOS**. RevenueCat uses the Clerk user ID as its app user ID. The API syncs entitlement state and checks usage before accepting translation, reply-audio, and history-save requests.

The configured free defaults are five translations and five reply-audio jobs per UTC calendar month; saving history requires the `pro` entitlement under the current limits. Active Pro users bypass these free quotas. This describes the local implementation, not a verified App Store product configuration or live billing rollout.

Relevant files: [lib/revenuecat.ts](lib/revenuecat.ts), [server/subscriptions.mjs](server/subscriptions.mjs), and [convex/subscriptions.ts](convex/subscriptions.ts). Configure the public iOS SDK key, the `pro` entitlement, server webhook authorization, and optional RevenueCat secret API key using [.env.example](.env.example).

## API surface

Except public health endpoints and separately authenticated operational/webhook routes, requests require `Authorization: Bearer <Clerk session token>`. Translation, history, and artifact routes also require current consent.

| Method and route | Purpose |
| --- | --- |
| `GET /health` | Public configuration/model summary |
| `GET /health/convex` | Public database connectivity check |
| `POST /v1/translations` | Queue Darija translation; returns `202` |
| `POST /v1/response-audio` | Queue English-to-Darija reply; returns `202` |
| `GET /v1/translations/:id` | Owned job state, text result, and safe artifact metadata |
| `GET /v1/response-audio/:id` | Reply-job detail alias |
| `GET /v1/translations` | Saved history list |
| `POST /v1/translations/:id/save` | Save an output to history |
| `GET /v1/translations/:id/artifacts/english-audio` | Stream English audio to the owner |
| `GET /v1/translations/:id/artifacts/arabic-response-audio` | Stream Darija reply audio to the owner |
| `GET /v1/me/privacy` | Consent and privacy state |
| `POST /v1/me/consent` | Accept current consent versions |
| `POST /v1/me/consent/revoke` | Revoke consent |
| `POST /v1/me/privacy-preferences` | Update history preference |
| `DELETE /v1/account` | Delete the user's account/app data; `/v1/me` is an alias |
| `GET /v1/me/subscription` | Entitlement and usage state |
| `POST /v1/me/subscription/sync` | Sync subscription state |

Both submission routes accept this JSON shape:

```json
{
  "filename": "recording.m4a",
  "audio_base64": "<base64-encoded audio>",
  "save_to_history": false
}
```

Legacy `POST /v1/translate-audio` and `POST /translate-audio` still execute the translation pipeline in the request. New mobile code uses the asynchronous `/v1/translations` route. Clerk and RevenueCat webhooks use their own signature/authorization checks; the retention cleanup route uses an operations secret. All are registered in [server/index.mjs](server/index.mjs).

## Repository map

| Path | Responsibility |
| --- | --- |
| [app/](app/) | Expo Router screens: landing, login/signup/verification, consent, translation/reply, history, account, and legal |
| [components/](components/) | Audio playback and shared glass-style UI controls |
| [lib/](lib/) | Public configuration, authenticated API client, TypeScript contracts, playback/sharing, and RevenueCat |
| [server/](server/) | Express routes, environment validation, Convex adapters, provider pipeline, privacy, deletion, and subscriptions |
| [trigger/](trigger/) | Thin background task definitions that call the server pipeline |
| [convex/](convex/) | Schema, auth, database/storage functions, and scheduled cleanup |
| [Visual guide](ai_docs/html-visuals/codebase-guide/index.html) | Archify diagrams, SVG previews, and generation notes |
| [ai_docs/](ai_docs/) | Plans, QA evidence, and operational documentation |
| [legal-pages/](legal-pages/) | Static privacy, terms, AI-processing, deletion, and support pages |
| [scripts/](scripts/) | Operational helpers, including TestFlight preflight checks |
| [supabase/](supabase/) | Archived persistence migrations/config; active persistence is Convex |
| `refs/` | Optional local reference projects; read-only reference material |

## Checks and build profiles

For source changes, the project's verification commands are:

```bash
node --check server/index.mjs
node --check server/translation-pipeline.mjs
node --check trigger/translate-audio-job.mjs
node --check trigger/response-audio-job.mjs
npm run typecheck
npm run lint
npx convex dev --once
npx expo-doctor
```

`npx convex dev --once` syncs backend code to the selected development deployment. These checks do not replace native-device, fresh-user, provider, or billing verification.

[eas.json](eas.json) defines development, preview, staging, and production profiles. Development uses a development client; staging uses the `preview` EAS environment with the `staging` update channel. Hosted builds need a reachable HTTPS API target. The repo includes production build configuration, but that alone does not establish production readiness.

Some older planning/deployment documents still describe Supabase. Use the active `server/`, `convex/`, `.env.example`, and build configuration as the authority for the current runtime.
