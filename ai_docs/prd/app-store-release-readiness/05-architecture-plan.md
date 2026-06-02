# Architecture Plan

## Data Flow

```text
Signed-in user
  |
  | accepts privacy + third-party AI processing consent
  v
Expo app
  |
  | Authorization: Bearer <Clerk session token>
  | POST /v1/translations { filename, audio_base64 }
  v
Production Cloud Run API
  |
  | verify Clerk session
  | enforce usage/rate limits/kill switch
  | store original audio in private Supabase Storage
  | create translation_jobs row
  | dispatch Trigger production task
  v
Trigger.dev production worker
  |
  | download private audio
  | OpenAI STT + Modal Darija ASR in parallel
  | OpenAI consolidation
  | OpenAI English translation
  | optional OpenAI English TTS
  v
Supabase production data/storage
  |
  | authenticated polling
  v
Expo app result/history/playback
```

## New Files

| File | Purpose |
| --- | --- |
| `docs/legal/privacy-policy.md` or hosted equivalent source | Source of public privacy policy content. |
| `docs/legal/terms.md` or hosted equivalent source | Source of terms of use. |
| `docs/legal/delete-account.md` or hosted equivalent source | Source of deletion policy and support path. |
| `app/legal.tsx` or route group equivalent | In-app legal/privacy screen. |
| `app/privacy-consent.tsx` or modal component | Explicit AI/audio processing consent gate. |
| `server/account.mjs` or equivalent module | Account deletion orchestration. |
| `ai_docs/deployment/app-store-submission.md` | App Store metadata, reviewer notes, demo account, and privacy labels checklist. |

## Modified Files

| File | Change |
| --- | --- |
| `app/account.tsx` | Add Privacy/Data, Legal, and Delete Account entries. |
| `app/signup.tsx` | Replace QA language and include links to privacy/terms/AI processing before account creation. |
| `app/translate.tsx` | Gate API URL, diagnostics, raw transcripts, and model metadata behind a non-production/debug flag. |
| `app/history.tsx` | Hide provider-run internals in production unless support mode is enabled. |
| `lib/config.ts` | Add release-mode flags such as `APP_ENV`, diagnostics visibility, legal URLs, and consent version. |
| `server/index.mjs` | Add account deletion endpoint and production-safe health/reviewer diagnostics. |
| `server/translations.mjs` | Add deletion/anonymization helpers for translation data. |
| `server/storage.mjs` | Add user-scoped deletion helpers for original audio and generated artifacts. |
| `server/profiles.mjs` | Ensure profile deletion covers app-owned profile state and Clerk webhook paths. |
| `eas.json` | Confirm production profile uses production channel/environment. |
| `app.json` / iOS config | Ensure permission strings and privacy manifest reflect production behavior. |

## Key Design Decisions

1. Keep mobile clients server-mediated. The app must not call OpenAI, Modal, Trigger.dev, or Supabase service-role APIs directly.
2. Treat original audio, transcripts, translations, and generated TTS audio as user data.
3. Keep private storage object keys private; mobile playback continues through authenticated API routes.
4. Keep diagnostics useful for support but hidden from normal production UI.
5. Prefer production resource isolation over reusing staging resources for public release.

