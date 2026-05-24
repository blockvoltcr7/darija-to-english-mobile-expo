# ImageGen Prompts

## 1. C4 Container Architecture

Create a C4 Container diagram for "Darija to English Mobile App with OpenAI TTS Playback".

Show a clean system boundary labeled "Darija Translation Platform". Inside the boundary include:
- Expo React Native mobile app: upload or record Moroccan Darija audio, poll job status, render English translation, play generated English audio.
- Node/Express API in `server/index.mjs`: Clerk auth, profile resolution, translation job creation, authenticated artifact download route.
- Trigger.dev worker in `trigger/translate-audio-job.mjs`: background job orchestration.
- Translation pipeline in `server/translation-pipeline.mjs`: parallel STT, consolidation, translation, optional TTS.
- Supabase Postgres: `translation_jobs`, `translation_results`, `provider_runs`, proposed `translation_artifacts`.
- Supabase private storage: original audio bucket `audio-originals`, generated audio bucket `translation-artifacts`.

External systems:
- Clerk: session token verification.
- OpenAI: STT, consolidation, English translation, `gpt-4o-mini-tts`.
- Modal Darija ASR: Moroccan Darija speech recognition.

Relationships:
- Mobile app sends authenticated `POST /v1/translations` with audio to Express API.
- API stores original audio, creates job rows, dispatches Trigger.dev.
- Worker runs the translation pipeline.
- Pipeline calls Modal and OpenAI, writes result rows, then if `ENABLE_TTS=true` calls OpenAI TTS.
- Pipeline uploads generated English audio to private Supabase storage and writes `translation_artifacts`.
- Mobile app polls `GET /v1/translations/:id`; when `tts.status=succeeded`, it calls authenticated `GET /v1/translations/:id/artifacts/english-audio`.

Style: clean professional C4 container diagram, white background, balanced left-to-right layout, readable labels, clear arrows with short relationship labels, subtle color grouping for app, server, data, and external providers, 16:9 landscape, avoid tiny text and clutter.

## 2. End-to-End Runtime Sequence

Create a UML Sequence Diagram for "English TTS generation after Darija translation completes".

Participants from left to right:
- User
- Expo app
- Clerk
- Express API
- Supabase Storage and Postgres
- Trigger.dev worker
- Translation pipeline
- Modal Darija ASR
- OpenAI APIs

Flow:
1. User submits Moroccan Darija audio in Expo app.
2. Expo app gets Clerk session token.
3. Expo app sends `POST /v1/translations` with Authorization header and audio payload.
4. Express API verifies Clerk session and resolves profile.
5. Express API stores original audio in private Supabase Storage and creates `translation_jobs`.
6. Express API dispatches Trigger.dev and returns queued job ID.
7. Expo app polls `GET /v1/translations/:id`.
8. Trigger.dev worker downloads stored audio.
9. Translation pipeline runs Modal Darija ASR and OpenAI STT in parallel.
10. OpenAI consolidates transcripts.
11. OpenAI translates consolidated Darija to English.
12. Pipeline writes `translation_results`.
13. If `ENABLE_TTS=true`, pipeline hashes English text plus provider config and checks for an existing matching artifact.
14. If no matching artifact exists, pipeline calls OpenAI `gpt-4o-mini-tts`.
15. Pipeline uploads generated audio to `translation-artifacts` private storage and marks `translation_artifacts.status=succeeded`.
16. Expo polling response includes `tts.status=succeeded` and an authenticated playback URL.
17. User taps Play; Expo app calls authenticated artifact route and plays audio.

Alternate paths:
- TTS disabled: API returns `tts=null` and text translation still succeeds.
- TTS failed: API returns `tts.status=failed`; English text remains visible.
- Duplicate retry: idempotency hash reuses existing successful artifact and avoids duplicate billing.

Style: clean UML sequence diagram, white background, vertical lifelines, activation bars, readable numbered message labels, parallel branch for Modal ASR and OpenAI STT, small alternate path boxes, 16:9 landscape, avoid tiny text.

## 3. TTS Artifact Persistence Model

Create an Entity Relationship Diagram for "OpenAI TTS artifact persistence".

Tables:
- `translation_jobs`: id primary key, clerk_user_id, status, audio_bucket, audio_object_key, artifact_bucket, artifact_prefix, trigger_run_id, created_at, updated_at.
- `translation_results`: id primary key, job_id foreign key, english_text, consolidated_transcript, created_at.
- `provider_runs`: id primary key, job_id foreign key, provider, operation, model, status, latency_ms, error_code, created_at.
- `translation_artifacts`: id primary key, job_id foreign key, clerk_user_id, kind, status, provider, model, voice, language, format, mime_type, bucket, object_key, byte_size, input_text_hash, input_char_count, duration_seconds, error_code, error_message, started_at, completed_at, created_at, updated_at.
- `Supabase private storage object`: bucket, object_key, mime_type, byte_size.

Relationships:
- `translation_jobs` has one `translation_results`.
- `translation_jobs` has many `provider_runs`.
- `translation_jobs` has many `translation_artifacts`.
- `translation_artifacts.bucket + object_key` points to private storage object in `translation-artifacts`.
- Unique idempotency index on `translation_artifacts`: job_id, kind, provider, model, voice, format, input_text_hash.

Callouts:
- RLS enabled, no anon or authenticated table grants, service_role only.
- `kind` is `english_tts_audio`.
- `provider` is `openai`.
- `format` supports `aac` and `mp3`.

Style: clean ERD, white background, readable table boxes, key fields only, cardinality markers, clear foreign-key arrows, callout notes for security and idempotency, 16:9 landscape, avoid tiny text.

## 4. Trust Boundary and Access-Control Flow

Create a Security Architecture Diagram for "Private OpenAI TTS playback trust boundaries".

Show zones:
- User device zone: Expo app, Clerk session token, public-safe metadata only.
- API trusted server zone: Express API, Clerk verification, server env validation, authenticated artifact route.
- Background worker trusted zone: Trigger.dev worker and translation pipeline.
- Private data zone: Supabase Postgres and Supabase private Storage.
- External provider zone: Clerk, OpenAI, Modal Darija ASR.

Show secrets and sensitive data boundaries:
- `OPENAI_API_KEY` stays server-side in API or worker runtime only.
- Supabase service role key stays server-side only.
- Clerk session token travels from Expo app to Express API in Authorization header.
- Private storage object keys are not exposed directly to the mobile app.
- Mobile app receives only safe TTS metadata and an authenticated API playback URL.
- Generated English audio is private user data protected by user ownership checks.

Main flow:
- Expo calls authenticated API.
- API verifies Clerk token and resolves owner.
- Worker calls OpenAI TTS server-side.
- Worker stores generated audio in private storage.
- API playback route checks Clerk owner before streaming audio.

Style: clean security boundary diagram, white background, strong zone boxes, padlock icons, red boundary lines only for secrets, blue arrows for authenticated user flow, orange arrows for server-side provider calls, readable labels, 16:9 landscape, avoid private hostnames and avoid tiny text.

## 5. Mobile Playback State Flow

Create a State Machine Diagram for "Expo English audio playback UI after translation".

States:
- Translation queued: no English text yet, no TTS controls.
- Translation running: progress visible, no TTS controls.
- Translation succeeded with `tts=null`: English text visible, no audio button, optional disabled audio availability indicator.
- TTS queued or running: English text visible, Play button disabled with loading state.
- TTS succeeded: English text visible, Play button enabled.
- Playback loading: user tapped Play, app requests authenticated audio URL.
- Playing: audio is playing, Pause or Stop control visible.
- Playback completed: return to Play button.
- TTS failed: English text visible, audio unavailable message or disabled control.
- Artifact auth failure: prompt retry or refresh session, text remains visible.

Transitions:
- Polling updates job status and `tts.status`.
- User tap Play starts authenticated audio fetch.
- Audio fetch success starts playback.
- Playback end returns to TTS succeeded.
- Fetch error or expired token moves to artifact auth failure.
- TTS error moves to TTS failed without changing translation success.

Style: clean state machine diagram, white background, rounded state boxes but not oversized, clear arrows, grouped lanes for Translation Result, TTS Artifact, and Audio Player, readable labels, professional mobile architecture documentation style, 16:9 landscape, avoid tiny text and clutter.
