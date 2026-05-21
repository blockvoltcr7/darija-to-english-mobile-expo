# 09 Implementation Phases

## Dependency Graph

```text
Phase 1: schema + repository
  |
  v
Phase 2: OpenAI TTS provider + storage
  |
  v
Phase 3: pipeline integration
  |
  v
Phase 4: API response + playback route
  |
  v
Phase 5: mobile playback UI
  |
  v
Phase 6: QA docs + verification
```

## Phase 1: Schema And Repository

Goal: create durable artifact state before adding provider calls.

Tasks:

- Create `supabase/migrations/<timestamp>_create_translation_artifacts.sql`.
- Add `translation_artifacts` table, constraints, indexes, RLS, service role grants, and updated-at trigger.
- Extend provider run operation constraint to include `openai_tts` if using `provider_runs`.
- Add `server/artifacts.mjs`.
- Add repository helpers for finding existing successful TTS artifact, marking running/succeeded/failed, and fetching user-owned audio artifact.

Deliverable:

- Migration and repository helpers exist.
- `node --check server/artifacts.mjs` passes.

Parallelization:

- Can run in parallel with Phase 2 only if function contracts are agreed first.

## Phase 2: OpenAI TTS Provider And Storage Helpers

Goal: add server-only TTS generation and private artifact upload.

Tasks:

- Add env parsing in `server/env.mjs`.
- Add `server/tts/openai-tts.mjs`.
- Add `server/tts/index.mjs`.
- Add generated audio MIME mapping to `server/storage.mjs`.
- Add `uploadTranslationArtifact(...)`.
- Add safe object key builder for `translation-artifacts`.

Deliverable:

- Provider helper can generate audio buffer from English text behind config.
- Storage helper can upload generated audio bytes with content type.

Dependencies:

- Requires OpenAI API key already present in server runtime.

## Phase 3: Pipeline Integration

Goal: run TTS after translation without breaking text result success.

Tasks:

- In `server/translation-pipeline.mjs`, run TTS after `writeTranslationResult(...)` when `ENABLE_TTS=true`.
- Compute idempotency hash from English text + provider/model/voice/format.
- Skip provider call if successful matching artifact exists.
- Record TTS provider run metadata.
- Mark artifact failed on TTS error without failing completed text translation.
- Include `tts` metadata in pipeline return object only if useful to synchronous legacy route.

Deliverable:

- Trigger job can complete text translation and separately create TTS artifact.

Dependency:

- Requires Phase 1 and Phase 2.

## Phase 4: API Response And Playback Route

Goal: expose audio availability and authenticated playback to the app.

Tasks:

- Extend `TRANSLATION_DETAIL_COLUMNS` in `server/translations.mjs` or fetch artifact separately.
- Add `toTtsArtifactDetail(...)` in `server/index.mjs`.
- Add `tts` field to `toTranslationDetail(...)`.
- Add `GET /v1/translations/:id/artifacts/english-audio`.
- Ensure playback route uses `requireClerkSession`.
- Return 404 when artifact is missing or belongs to another user.

Deliverable:

- `GET /v1/translations/:id` includes `tts`.
- Authenticated playback route returns audio bytes for owner only.

Dependency:

- Requires Phase 1.

## Phase 5: Mobile Playback UI

Goal: let signed-in users play generated English audio.

Tasks:

- Extend `TranslationTtsArtifact` in `lib/types.ts`.
- Map `tts` in `lib/api.ts`.
- Add audio fetch/play helper if `expo-audio` cannot attach auth headers.
- Update `app/translate.tsx` with Play/Pause UI under English translation.
- Update `app/history.tsx` detail view with the same playback behavior.
- Add AI-generated voice disclosure.
- Preserve existing result panels and diagnostics.

Deliverable:

- iOS development build can play generated English audio for completed translations.

Dependency:

- Requires Phase 4.

## Phase 6: QA Docs And Verification

Goal: update evidence path and verify the feature end to end.

Tasks:

- Update `ai_docs/fresh-clerk-user-qa.md`.
- Update `server/AGENTS.md` and relevant docs after code behavior changes.
- Run static checks:

```bash
node --check server/index.mjs
node --check server/translation-pipeline.mjs
node --check trigger/translate-audio-job.mjs
npm run typecheck
npm run lint
npx expo-doctor
curl http://localhost:8787/health
```

- Run fresh Clerk user QA with `ENABLE_TTS=true`.
- Verify logs do not include full translation text, provider secrets, or audio bytes.
- Verify forced TTS failure still returns text result.
- Verify cross-user playback is denied.

Deliverable:

- PRD acceptance evidence is captured without secrets or private audio contents.
