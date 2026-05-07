# Darija to English Mobile

Expo MVP for signing in with Clerk, recording or uploading Moroccan Darija audio, running dual speech-to-text, consolidating the Arabic/Darija transcripts, and translating the result to English.

Pipeline:

```text
Clerk session
 -> Authenticated API request
 -> Audio
 -> OpenAI STT (gpt-4o-mini-transcribe)
 -> Modal Darija ASR
 -> OpenAI consolidation (gpt-5.5)
 -> OpenAI English translation (gpt-5.5)
```

## Setup

```bash
npm install
cp .env.example .env
```

Fill in `.env`:

```bash
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
DARIJA_ASR_BASE_URL=https://your-workspace--transcribe.modal.run
# or DARIJA_ASR_URL=https://your-workspace--transcribe.modal.run
DARIJA_ASR_API_KEY=...
OPENAI_API_KEY=...
OPENAI_TRANSCRIPTION_MODEL=gpt-4o-mini-transcribe
OPENAI_CONSOLIDATION_MODEL=gpt-5.5
OPENAI_TRANSLATION_MODEL=gpt-5.5
```

Set `EXPO_PUBLIC_API_BASE_URL` for the target:

```bash
# iOS simulator
EXPO_PUBLIC_API_BASE_URL=http://localhost:8787

# Android emulator
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8787

# Physical device on the same Wi-Fi
EXPO_PUBLIC_API_BASE_URL=http://YOUR_LAN_IP:8787
```

Clerk native auth components require a development build. Use `npm run ios` or `npm run android`, not plain Expo Go, for the full sign-in experience.

## Run Locally

Start the local proxy API:

```bash
npm run api
```

`GET /health` is public. `POST /v1/translate-audio` requires `Authorization: Bearer <Clerk session token>`.

Start Expo in another terminal:

```bash
npm run ios
# or
npm run android
```

After a development build is installed, start Metro with:

```bash
npm run start
```

`npm run start:go` is kept only for non-auth Expo Go experiments. The Clerk native sign-in screen requires the development build.

Use this form for physical device development builds:

```bash
npx expo start --lan --clear
```

## Checks

```bash
npm run typecheck
npm run lint
npx expo-doctor
```
