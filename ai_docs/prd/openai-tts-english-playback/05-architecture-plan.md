# 05 Architecture Plan

## Data Flow

```text
Expo app
  |
  | POST /v1/translations
  v
server/index.mjs
  |
  | Clerk auth + profile resolution
  | store original audio in audio-originals
  | create translation_jobs row
  | dispatch Trigger.dev
  v
trigger/translate-audio-job.mjs
  |
  v
server/translation-pipeline.mjs
  |
  | parallel STT:
  | - Modal Darija ASR
  | - OpenAI transcription
  |
  | OpenAI consolidation
  | OpenAI translation
  | write translation_results
  |
  | if ENABLE_TTS=true:
  | - hash englishText + provider config
  | - skip if matching artifact exists
  | - call OpenAI gpt-4o-mini-tts
  | - upload audio to translation-artifacts
  | - write translation_artifacts
  v
Supabase
  |
  | GET /v1/translations/:id
  v
Expo app renders text + Play button when tts.status=succeeded
```

## New Files

| File | Purpose |
| --- | --- |
| `server/tts/openai-tts.mjs` | Calls OpenAI `audio.speech.create` and returns audio buffer plus safe metadata. |
| `server/tts/index.mjs` | Provider router, feature flag checks, idempotency hash helper, shared TTS contract. |
| `server/artifacts.mjs` | Repository helpers for `translation_artifacts` rows. |
| `supabase/migrations/<timestamp>_create_translation_artifacts.sql` | Adds artifact table, constraints, indexes, RLS, service role grants, updated-at trigger. |

## Modified Files

| File | Change |
| --- | --- |
| `server/env.mjs` | Add `ENABLE_TTS`, `TTS_PROVIDER`, `TTS_LANGUAGE`, `TTS_RESPONSE_FORMAT`, `OPENAI_TTS_MODEL`, `OPENAI_TTS_VOICE`. Add public-secret guard if future TTS secrets are introduced. |
| `server/storage.mjs` | Add generated artifact object-key builder, MIME mapping, upload helper, and possibly authenticated download helper. |
| `server/translations.mjs` | Add `OPENAI_TTS` provider operation and query fields if provider-run tracking is used there. |
| `server/translation-pipeline.mjs` | Run TTS after `writeTranslationResult`, behind feature flag and idempotency check. |
| `server/index.mjs` | Include artifact relation in detail response and add authenticated audio download route. |
| `lib/types.ts` | Add `TranslationTtsArtifact` and attach it to result/detail/list types as needed. |
| `lib/api.ts` | Map server `tts` field into mobile result and build authenticated playback URL if needed. |
| `app/translate.tsx` | Add Play control under English translation. |
| `app/history.tsx` | Add audio availability/playback in detail view. |
| `ai_docs/fresh-clerk-user-qa.md` | Extend QA checklist with TTS artifact and playback verification. |
| `server/AGENTS.md` | Update pipeline docs after implementation to include OpenAI TTS step. |

## Key Design Decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Provider | OpenAI `gpt-4o-mini-tts` | Existing OpenAI backend dependency and best integration efficiency. |
| Default voice | `marin` | OpenAI recommends `marin`/`cedar`; `marin` is the first MVP candidate. |
| Default format | `aac` first, `mp3` fallback | `aac` is mobile-friendly; `mp3` remains broadest compatibility if Expo playback has issues. |
| Completion semantics | Text result succeeds independently from TTS. | Users should not lose text translation due to TTS provider failure. |
| Playback access | Authenticated API download route. | Avoid leaking private storage object keys and make access checks explicit. |
| Persistence | New `translation_artifacts` table. | Audio artifacts have their own lifecycle and retry/error state. |
| Idempotency | Hash English text and provider config. | Prevent duplicate billing on Trigger retries. |
| Mobile behavior | No autoplay. | Avoid surprising audio playback and simplify permissions. |

## Trust Boundaries

- Expo can receive only public-safe metadata and authenticated app URLs.
- OpenAI API key stays in server/Trigger runtime.
- Supabase service key stays in server runtime.
- Clerk session token is only used to authenticate app API requests.
- Generated audio is private user data and must follow the same owner boundary as translation text.
