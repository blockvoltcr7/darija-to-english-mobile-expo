# AGENTS.md

## Scope

This is a single Expo React Native project with a local Node/Express API. Treat `refs/` as reference material only unless the user explicitly asks to modify a reference project.

## Module Map

| Path | Purpose |
| --- | --- |
| `app/` | Expo Router app screens and mobile UI. See `app/AGENTS.md`. |
| `lib/` | Shared client config, API client, and TypeScript contracts. See `lib/AGENTS.md`. |
| `server/` | Local API proxy for dual STT, consolidation, and translation. See `server/AGENTS.md`. |
| `docs/` | Plans, launch notes, and operational docs. See `docs/AGENTS.md`. |
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
- Expo: `npm run start`, `npm run ios`, or `npm run android`
- Physical device Expo Go: `npx expo start --lan --clear`
- iOS simulator API URL: `EXPO_PUBLIC_API_BASE_URL=http://localhost:8787`
- Android emulator API URL: `EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8787`
- Physical device API URL: `EXPO_PUBLIC_API_BASE_URL=http://<mac-lan-ip>:8787`

## Cross-Domain Workflow

- Mobile upload/recording calls `lib/api.ts`.
- `lib/api.ts` posts `{ filename, audio_base64 }` to `/translate-audio`.
- `server/index.mjs` runs OpenAI STT and Modal Darija ASR in parallel.
- Server requires both STT outputs, consolidates with OpenAI, then translates consolidated Darija to English.
- Server returns raw transcripts, consolidated transcript, English translation, model metadata, and aliases for older UI fields.

## Verification

Run these after code changes:

```bash
node --check server/index.mjs
npm run typecheck
npm run lint
npx expo-doctor
```

For API behavior, also test:

```bash
curl http://localhost:8787/health
```

Expected `/health` response includes `models.openai_transcription`, `models.consolidation`, and `models.translation`.
