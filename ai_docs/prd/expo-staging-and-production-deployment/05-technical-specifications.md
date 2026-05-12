# 05 — Technical Specifications

## EAS Build Profiles

Create `eas.json` with at least:

```json
{
  "cli": {
    "version": ">= 16.0.1",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "environment": "development",
      "channel": "development"
    },
    "preview": {
      "distribution": "internal",
      "environment": "preview",
      "channel": "preview"
    },
    "staging": {
      "distribution": "store",
      "environment": "preview",
      "channel": "staging",
      "autoIncrement": true
    },
    "production": {
      "environment": "production",
      "channel": "production",
      "autoIncrement": true
    }
  },
  "submit": {
    "staging": {},
    "production": {}
  }
}
```

Exact submit credentials should be filled after Apple App Store Connect and Google Play Console setup decisions are confirmed.

## EAS Environment Variables

Public variables compiled into the mobile app:

| Variable | Development | Preview | Staging | Production |
| --- | --- | --- | --- | --- |
| `EXPO_PUBLIC_API_BASE_URL` | `http://localhost:8787` for simulator or Mac LAN IP for device dev | `https://preview-api.<domain>` or staging API | `https://staging-api.<domain>` | `https://api.<domain>` |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk dev/test publishable key | Clerk test publishable key | Clerk test/staging publishable key | Clerk production publishable key |
| `EXPO_PUBLIC_SUPABASE_URL` | Current Supabase URL if client needs it | Staging/public URL if needed | Staging/public URL if needed | Production/public URL if needed |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key only | Publishable key only | Publishable key only | Publishable key only |

Do not put these in Expo public env:

- `OPENAI_API_KEY`
- `DARIJA_ASR_API_KEY`
- `CLERK_SECRET_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TRIGGER_SECRET_KEY`
- Modal secrets or bearer tokens

## API Runtime Contract

The deployed API must preserve the existing app contract.

### Health

```http
GET /health
```

Expected shape includes:

```json
{
  "ok": true,
  "service": "darija-to-english-api",
  "dependencies": {
    "clerk": true,
    "darija_asr": true,
    "openai": true,
    "supabase": true
  },
  "models": {
    "openai_transcription": "gpt-4o-mini-transcribe",
    "consolidation": "gpt-5.5",
    "translation": "gpt-5.5"
  }
}
```

### Create Translation

```http
POST /v1/translations
Authorization: Bearer <Clerk session token>
Content-Type: application/json
```

Request:

```json
{
  "filename": "audio.m4a",
  "audio_base64": "<base64 audio>"
}
```

Queued response:

```json
{
  "jobId": "<translation uuid>",
  "triggerRunId": "<trigger run id>",
  "status": "queued",
  "detailUrl": "/v1/translations/<translation uuid>"
}
```

### Poll Translation

```http
GET /v1/translations/:id
Authorization: Bearer <Clerk session token>
```

The app expects final detail to include:

- status
- English translation
- consolidated Darija transcript
- OpenAI transcript
- Darija model transcript
- model metadata
- Trigger run ID

## Trigger Runtime Contract

The deployed Trigger worker must:

1. Claim a stored translation job.
2. Download stored audio from Supabase Storage.
3. Start OpenAI STT and Modal Darija ASR in parallel.
4. Require both transcripts to be non-empty.
5. Consolidate with OpenAI.
6. Translate with OpenAI.
7. Persist status, provider runs, metadata, consolidated transcript, and English translation.

Existing scripts:

```bash
npm run trigger:deploy:staging
npm run trigger:deploy:prod
```

## API Host Environment Variables

The staging and production API host must define:

- `PORT`
- `HOST` if required by the host
- `CLERK_SECRET_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `DARIJA_ASR_BASE_URL` or `DARIJA_ASR_URL`
- `DARIJA_ASR_API_KEY`
- Trigger.dev SDK credentials required for dispatch
- Model override variables only when intentionally changed

## Verification Commands

Local:

```bash
node --check server/index.mjs
npm run typecheck
npm run lint
npx expo-doctor
curl http://localhost:8787/health
```

Staging:

```bash
curl https://<staging-api>/health
npx eas-cli@latest build -p ios --profile preview
npx eas-cli@latest build -p android --profile preview
```
