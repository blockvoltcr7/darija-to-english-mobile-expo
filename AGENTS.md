# AGENTS.md

## Scope

This is a single Expo React Native project with a local Node/Express API. Treat `refs/` as reference material only unless the user explicitly asks to modify a reference project.

## Module Map

| Path | Purpose |
| --- | --- |
| `app/` | Expo Router app screens and mobile UI. See `app/AGENTS.md`. |
| `lib/` | Shared client config, API client, and TypeScript contracts. See `lib/AGENTS.md`. |
| `server/` | Local API proxy for dual STT, consolidation, and translation. See `server/AGENTS.md`. |
| `trigger/` | Trigger.dev background jobs for async translation work. See `trigger/AGENTS.md`. |
| `convex/` | Convex schema, auth config, functions, and storage integration for app persistence. |
| `supabase/` | Archived legacy migrations/config for pre-Convex persistence. Do not extend. |
| `ai_docs/` | Plans, QA playbooks, visuals, and operational docs. See `ai_docs/AGENTS.md`. |
| `.agents/skills/` | Project-scoped Codex skills such as iOS Simulator file loading. |
| `refs/openai-speech-to-text-app/` | Reference dual-STT/consolidation web app. Read only by default. |
| `refs/darija-model-speech-to-text/` | Reference Modal/Darija ASR code. Read only by default. |
| `refs/os-hq-mobile-expo-native/` | Reference Expo app scaffold/style source. Read only by default. |

## Global Rules

- Do not read or edit `node_modules/`, `.expo/`, `.next/`, or generated reference outputs unless debugging requires it.
- Do not print secrets from `.env`, `.env.local`, or reference projects.
- Keep API keys and paid service calls server-side. The mobile app must not call OpenAI or Modal directly.
- Keep `refs/` changes out of normal implementation work; copy proven patterns into this app instead.
- Use `rg`/`rg --files` for repository search.
- Use `apply_patch` for manual edits.

## Local Development

- API: `npm run api`
- Trigger worker: `npm run trigger:dev`
- Expo: `npm run start`, `npm run ios`, or `npm run android`
- Physical device Expo Go: `npx expo start --lan --clear`
- iOS simulator API URL: `EXPO_PUBLIC_API_BASE_URL=http://localhost:8787`
- Android emulator API URL: `EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8787`
- Physical device API URL: `EXPO_PUBLIC_API_BASE_URL=http://<mac-lan-ip>:8787`
- EAS development-client builds use the default `development` EAS environment.
- EAS preview builds use the default `preview` EAS environment.
- EAS staging builds currently also use the default `preview` EAS environment because custom EAS environments require a paid Expo Production or Enterprise plan.
- EAS production env values should not be configured until a production API URL exists.
- EAS public env must only contain mobile-safe public values such as `EXPO_PUBLIC_API_BASE_URL`, `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`, `EXPO_PUBLIC_CONVEX_URL`, and `EXPO_PUBLIC_CONVEX_SITE_URL`.

## Cross-Domain Workflow

- Mobile upload/recording calls `lib/api.ts` after Clerk signs the user in.
- `lib/api.ts` posts `{ filename, audio_base64 }` to authenticated `/v1/translations`; `/v1/translate-audio` is legacy-compatible.
- `lib/api.ts` also supports authenticated `/v1/response-audio` for English voice replies that become Moroccan Darija reply text plus Arabic/Darija TTS audio.
- The mobile app sends `Authorization: Bearer <Clerk session token>`.
- `server/index.mjs` verifies the Clerk session before storage, Trigger.dev dispatch, or model/provider calls.
- Server stores the original audio in private Convex Storage, creates a Convex translation row, dispatches `trigger/translate-audio-job.mjs`, and returns a queued job with a Trigger run ID.
- The mobile app polls `/v1/translations/:id` with refreshed Clerk session tokens until the job succeeds or fails.
- The Trigger worker downloads stored audio, runs OpenAI STT and Modal Darija ASR in parallel, requires both STT outputs, consolidates with OpenAI, then translates consolidated Darija to English.
- If `ENABLE_TTS=true`, the Trigger worker generates OpenAI English TTS only after the text result is stored, uploads generated audio to private Convex Storage, and records `translationArtifacts` metadata. TTS failure must not hide the English translation.
- If `ENABLE_RESPONSE_TTS=true`, the response-audio worker uses OpenAI STT, OpenAI text generation, and OpenAI TTS to store a private Convex artifact with kind `arabic_response_tts_audio`.
- Server returns raw transcripts, consolidated transcript, English translation, model metadata, Trigger run ID, optional safe `tts` and `responseAudio` metadata, and aliases for older UI fields.
- Playback and sharing must go through authenticated API routes; do not expose private Convex storage IDs or generated storage URLs to the mobile app.

## Auth Workflow

- Clerk is the auth provider for mobile, API, and Convex identity.
- Sign-in is email-code-only. Do not reintroduce password sign-in fields or password requirements unless the user explicitly reverses this product decision.
- Convex uses Clerk JWT auth through `ConvexProviderWithClerk`; Convex functions that depend on auth must use `ctx.auth.getUserIdentity()`.

## Fresh Clerk User QA

Use this acceptance path before moving from Epic 03 into Epic 04 release-readiness work:

1. Start the API and Trigger worker:

```bash
ENABLE_TTS=true ENABLE_RESPONSE_TTS=true npm run api
ENABLE_TTS=true ENABLE_RESPONSE_TTS=true npm run trigger:dev
```

2. Load a non-sensitive audio fixture into the iOS Simulator Files app with the project skill:

```bash
.agents/skills/ios-simulator-files/scripts/add_to_simulator_files.sh /absolute/path/to/audio.m4a
```

3. Run the app in an iOS development build, not Expo Go. Use `EXPO_PUBLIC_API_BASE_URL=http://localhost:8787` for the simulator.
4. In the app, open Account, sign out, then sign in with a Clerk test user through the email-code flow. If fresh-user signup is required, verify the app signup path is passwordless before using it.
5. Confirm the app shows the new user's email, upload the simulator audio file, and wait for `Complete`.
6. Verify UI results: English translation, consolidated Darija, raw OpenAI transcript, raw Darija transcript, model metadata, diagnostics, and, when TTS is enabled and succeeded, explicit English audio playback are visible.
7. Use `Record Reply` to record an English response and verify the app shows the English transcript, Moroccan Darija reply text, playback, and share action for the Arabic/Darija audio artifact.
8. Verify logs: API health check, profile resolution for the new Clerk user, queued job ID, Trigger run ID, stored audio download, OpenAI STT completion, Modal ASR HTTP 200, consolidation, translation, optional TTS/response artifact state, and final job `succeeded` status.
9. Do not copy Clerk session tokens, API keys, `.env` values, private audio contents, full transcripts, or generated audio bytes into docs or screenshots.

## Verification

Run these after code changes:

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

For API behavior, also test:

```bash
curl http://localhost:8787/health
curl http://localhost:8787/health/convex
```

Expected `/health` response includes `dependencies.convex`, `models.openai_transcription`, `models.consolidation`, and `models.translation`.

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
