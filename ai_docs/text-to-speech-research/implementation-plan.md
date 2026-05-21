# TTS Implementation Plan

Research date: 2026-05-21

This is a repo-specific plan for adding spoken English playback after translation completion.
It is not implemented yet.

## Current Ownership

| Area | Current file | Role |
| --- | --- | --- |
| Mobile upload and polling | `lib/api.ts` | Posts audio to `POST /v1/translations`, polls `GET /v1/translations/:id`, maps detail response into `TranslationResult`. |
| Mobile translation UI | `app/translate.tsx` | Shows upload/record controls, English translation, consolidated Darija, raw STT outputs, model metadata, and diagnostics. |
| Mobile history UI | `app/history.tsx` | Shows recent translations and detail view for existing results. |
| API orchestration | `server/index.mjs` | Verifies Clerk, creates jobs, stores source audio, dispatches Trigger.dev, returns history/detail responses. |
| Provider pipeline | `server/translation-pipeline.mjs` | Runs ASR, consolidation, translation, and writes `translation_results`. |
| Persistence layer | `server/translations.mjs` | Owns translation job/result/provider-run repository functions and metadata sanitization. |
| Storage helpers | `server/storage.mjs` | Owns original audio storage normalization and Supabase Storage upload/delete helpers. |
| Trigger task | `trigger/translate-audio-job.mjs` | Runs stored translation jobs in Trigger.dev. |

## Target Behavior

After a translation job has final English text:

1. The backend generates an English TTS audio file.
2. The generated audio is stored in private Supabase Storage.
3. The translation detail response includes TTS metadata.
4. The app shows a Play button when audio is available.
5. The app still shows text translation even if TTS fails.

## Data Model Options

Preferred: add a new table for generated artifacts.

Suggested table: `translation_artifacts`

Columns:

| Column | Purpose |
| --- | --- |
| `id` | Artifact UUID. |
| `job_id` | FK to `translation_jobs.id`. |
| `clerk_user_id` | Owner boundary for authenticated access. |
| `kind` | Example: `english_tts_audio`. |
| `status` | `queued`, `running`, `succeeded`, `failed`, `canceled`. |
| `provider` | `openai`, `elevenlabs`, `google`, `xai`, etc. |
| `model` | Provider model identifier. |
| `voice` | Voice ID/name. |
| `language` | `en` for MVP. |
| `format` | `mp3`, `aac`, `wav`, etc. |
| `mime_type` | Example: `audio/mpeg`, `audio/aac`. |
| `bucket` | Supabase Storage bucket, likely `translation-artifacts`. |
| `object_key` | Private storage key. |
| `byte_size` | Generated audio byte size. |
| `input_text_hash` | Hash of English text plus provider/model/voice/format for idempotency. |
| `input_char_count` | English text length. |
| `duration_seconds` | Optional, if measured. |
| `error_code` | Provider or app error code. |
| `error_message` | Sanitized error message. |
| `created_at` / `updated_at` / `completed_at` | Audit timestamps. |

Alternative: store TTS metadata inside `translation_results.model_metadata`.

Do not use the alternative for the first real implementation unless migration time is the blocker.
Audio artifacts have their own lifecycle, retry behavior, storage keys, and deletion policy, so a table is cleaner.

## Provider Abstraction

Add a server-side provider module, for example:

```text
server/tts/
  index.mjs
  openai-tts.mjs
  elevenlabs-tts.mjs
  gemini-tts.mjs
  xai-tts.mjs
```

Minimal provider return contract:

```ts
{
  provider: string;
  model: string;
  voice: string;
  language: "en";
  format: "mp3" | "aac" | "wav";
  mimeType: string;
  audioBuffer: Buffer;
  inputCharCount: number;
  durationSeconds?: number;
  usage?: Record<string, unknown>;
}
```

MVP provider config:

```text
ENABLE_TTS=false
TTS_PROVIDER=openai
TTS_LANGUAGE=en
TTS_RESPONSE_FORMAT=aac
OPENAI_TTS_MODEL=gpt-4o-mini-tts
OPENAI_TTS_VOICE=marin
```

Optional future provider config:

```text
ELEVENLABS_API_KEY=...
ELEVENLABS_TTS_MODEL_ID=eleven_flash_v2_5
ELEVENLABS_VOICE_ID=...
ELEVENLABS_OUTPUT_FORMAT=mp3_44100_128

GEMINI_API_KEY=...
GEMINI_TTS_MODEL=gemini-3.1-flash-tts-preview
GEMINI_TTS_VOICE=Kore

XAI_API_KEY=...
XAI_TTS_VOICE_ID=eve
XAI_TTS_FORMAT=mp3
```

Only mobile-safe values can ever use `EXPO_PUBLIC_*`. None of these provider secrets are mobile-safe.

## Pipeline Placement

Recommended first placement:

1. `server/translation-pipeline.mjs` completes `translateConsolidatedTranscript(...)`.
2. `writeTranslationResult(...)` persists text results.
3. A TTS step runs only if `ENABLE_TTS=true`.
4. The TTS step checks for an existing successful artifact with the same `job_id`, `kind`,
   provider/model/voice/format, and English-text hash.
5. If no artifact exists, generate audio, upload to Supabase Storage, and mark artifact succeeded.
6. If TTS fails, mark artifact failed but keep translation job `succeeded`.

Important product choice:

- If TTS is part of the definition of "complete", run it before marking the translation job succeeded.
- If text translation is primary and TTS is an add-on, mark text translation succeeded first and generate
  TTS as a follow-up job or non-blocking step.

For this app, use the add-on behavior first. The user should not lose text results because a voice provider is down.

## Storage

Use private Supabase Storage.

Suggested object key:

```text
<clerk_user_id>/<job_id>/english-tts/<provider>-<model>-<voice>-<hash>.<ext>
```

Examples:

```text
user_abc/935a8a49-d244-4b40-b23b-1041bbd34b55/english-tts/openai-gpt-4o-mini-tts-marin-a1b2c3.aac
user_abc/935a8a49-d244-4b40-b23b-1041bbd34b55/english-tts/elevenlabs-eleven_flash_v2_5-voice123-a1b2c3.mp3
```

Do not expose raw storage object keys without auth. Either:

- Generate short-lived signed URLs from an authenticated API route, or
- Add an authenticated download route such as `GET /v1/translations/:id/artifacts/english-audio`.

The second option is cleaner for revocation and audit.

## API Response Shape

Extend `GET /v1/translations/:id` detail result with a `tts` field:

```json
{
  "tts": {
    "status": "succeeded",
    "provider": "openai",
    "model": "gpt-4o-mini-tts",
    "voice": "marin",
    "language": "en",
    "format": "aac",
    "mimeType": "audio/aac",
    "byteSize": 123456,
    "durationSeconds": 42.1,
    "audioUrl": "/v1/translations/<id>/artifacts/english-audio",
    "createdAt": "2026-05-21T00:00:00.000Z"
  }
}
```

For failed TTS:

```json
{
  "tts": {
    "status": "failed",
    "provider": "openai",
    "model": "gpt-4o-mini-tts",
    "voice": "marin",
    "errorCode": "provider_error",
    "errorMessage": "Speech generation failed."
  }
}
```

Do not include provider secrets, full request payloads, full text, or storage service credentials.

## Mobile UI

`app/translate.tsx`:

- Show a compact Play button below the English translation when `result.tts.status === "succeeded"`.
- Show a muted "Voice unavailable" diagnostic state only if useful during QA.
- Do not block reading/copying the English text on audio status.
- Include a visible disclosure near playback that the voice is AI-generated.

`app/history.tsx`:

- Show audio availability in detail view.
- Do not autoplay history audio.

`lib/types.ts`:

- Add `tts` metadata to `TranslationResult` and `TranslationHistoryDetail`.

`lib/api.ts`:

- Map server `tts` detail into mobile types.
- Preserve existing aliases: `translation` remains English text, `transcript` remains consolidated Darija.

## Verification

Docs-only research does not require code verification. When implementation starts, run:

```bash
node --check server/index.mjs
node --check server/translation-pipeline.mjs
node --check trigger/translate-audio-job.mjs
npm run typecheck
npm run lint
npx expo-doctor
curl http://localhost:8787/health
```

Provider QA:

1. Generate TTS for 5-10 representative English translations.
2. Confirm no provider key appears in app logs, server logs, screenshots, or responses.
3. Confirm duplicate polling does not regenerate audio.
4. Force a Trigger retry and confirm idempotency.
5. Confirm iOS simulator playback.
6. Confirm Android emulator playback if Android is in scope.
7. Confirm `GET /v1/translations/:id` only exposes audio for the owning Clerk user.
8. Confirm audio artifact deletion/retention follows the same privacy posture as translation artifacts.

Fresh-user QA should extend the existing acceptance path:

- Sign in as a fresh Clerk test user.
- Upload the simulator audio fixture.
- Wait for text translation success.
- Wait for TTS artifact success if the feature flag is enabled.
- Verify UI results: English text, consolidated Darija, raw STT outputs, model metadata, diagnostics,
  and English audio playback.
- Verify logs: provider start/success/failure metadata, output bytes, artifact path, and no full
  private text/audio contents.

## Implementation Sequence

1. Add migration for `translation_artifacts`.
2. Add repository helpers in `server/translations.mjs` or a new `server/artifacts.mjs`.
3. Add `server/tts/openai-tts.mjs` and a provider router.
4. Add artifact storage upload helper.
5. Wire TTS into the Trigger pipeline behind `ENABLE_TTS`.
6. Extend API detail response with `tts`.
7. Extend `lib/types.ts` and `lib/api.ts`.
8. Add playback UI to `app/translate.tsx`.
9. Add history detail playback to `app/history.tsx`.
10. Add QA notes to `ai_docs/fresh-clerk-user-qa.md`.

## Open Questions Before Coding

- Should TTS be automatic for every completed translation, or generated on demand when the user taps Play?
- Should text translation be marked complete before TTS finishes?
- Which provider should own MVP: OpenAI for simplicity, or ElevenLabs for voice quality?
- What audio format should be the app default after iOS and Android playback tests: `aac` or `mp3`?
- What retention policy applies to generated English audio?
- Should generated audio be downloadable/shareable, or playback-only?
