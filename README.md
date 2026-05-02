# Darija to English Mobile

Expo MVP for recording or uploading Moroccan Darija audio, running dual speech-to-text, consolidating the Arabic/Darija transcripts, and translating the result to English.

Pipeline:

```text
Audio
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

For Expo Go on a real iPhone, `EXPO_PUBLIC_API_BASE_URL` must be your Mac's LAN IP, not `localhost`.

## Run Locally

Start the local proxy API:

```bash
npm run api
```

Start Expo in another terminal:

```bash
npm run ios
# or
npm run android
```

For Expo Go on a physical device:

```bash
npm run start
```

Use this form for physical device testing:

```bash
npx expo start --lan --clear
```

## Checks

```bash
npm run typecheck
npm run lint
npx expo-doctor
```
