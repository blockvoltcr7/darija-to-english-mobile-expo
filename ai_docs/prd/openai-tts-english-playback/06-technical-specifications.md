# 06 Technical Specifications

## Environment

Add server-only env vars:

```text
ENABLE_TTS=false
TTS_PROVIDER=openai
TTS_LANGUAGE=en
TTS_RESPONSE_FORMAT=aac
OPENAI_TTS_MODEL=gpt-4o-mini-tts
OPENAI_TTS_VOICE=marin
```

Rules:

- `ENABLE_TTS` defaults to false.
- `TTS_PROVIDER` supports `openai` in MVP.
- `TTS_RESPONSE_FORMAT` supports `aac` and `mp3` in MVP.
- `OPENAI_API_KEY` remains the credential for OpenAI calls.
- No TTS env var can use `EXPO_PUBLIC_*`.

## OpenAI TTS Request

Server-side call:

```ts
const response = await client.audio.speech.create({
  model: env.OPENAI_TTS_MODEL,
  voice: env.OPENAI_TTS_VOICE,
  input: englishText,
  instructions: 'Speak clearly in a warm, neutral voice.',
  response_format: env.TTS_RESPONSE_FORMAT,
});

const audioBuffer = Buffer.from(await response.arrayBuffer());
```

Input constraints:

- Do not call TTS with empty `englishText`.
- Cap or chunk text if OpenAI input limits are reached.
- MVP can fail TTS gracefully for overly long translations instead of chunking if chunking would delay delivery.

## Generated Audio MIME Map

```ts
const TTS_OUTPUT_FORMATS = {
  aac: { mimeType: 'audio/aac', extension: 'aac' },
  mp3: { mimeType: 'audio/mpeg', extension: 'mp3' },
};
```

## Artifact Table

Migration target:

```sql
create table public.translation_artifacts (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.translation_jobs(id) on delete cascade,
  clerk_user_id text not null,
  kind text not null,
  status text not null default 'queued',
  provider text not null,
  model text not null,
  voice text,
  language text not null default 'en',
  format text not null,
  mime_type text not null,
  bucket text,
  object_key text,
  byte_size integer,
  input_text_hash text not null,
  input_char_count integer not null,
  duration_seconds numeric,
  error_code text,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint translation_artifacts_kind_check
    check (kind in ('english_tts_audio')),
  constraint translation_artifacts_status_check
    check (status in ('queued', 'running', 'succeeded', 'failed', 'canceled')),
  constraint translation_artifacts_provider_check
    check (provider in ('openai')),
  constraint translation_artifacts_language_check
    check (language = 'en'),
  constraint translation_artifacts_format_check
    check (format in ('aac', 'mp3')),
  constraint translation_artifacts_bucket_check
    check (bucket is null or bucket = 'translation-artifacts'),
  constraint translation_artifacts_location_check
    check (
      (bucket is null and object_key is null)
      or (bucket is not null and object_key is not null)
    ),
  constraint translation_artifacts_byte_size_check
    check (byte_size is null or byte_size >= 0),
  constraint translation_artifacts_input_char_count_check
    check (input_char_count >= 0),
  constraint translation_artifacts_duration_seconds_check
    check (duration_seconds is null or duration_seconds >= 0),
  constraint translation_artifacts_completion_check
    check (completed_at is null or started_at is null or completed_at >= started_at)
);
```

Indexes:

```sql
create unique index translation_artifacts_idempotency_idx
on public.translation_artifacts (
  job_id,
  kind,
  provider,
  model,
  coalesce(voice, ''),
  format,
  input_text_hash
);

create index translation_artifacts_job_id_created_at_idx
on public.translation_artifacts (job_id, created_at);

create index translation_artifacts_clerk_user_id_created_at_idx
on public.translation_artifacts (clerk_user_id, created_at desc);
```

Security:

```sql
alter table public.translation_artifacts enable row level security;
revoke all on table public.translation_artifacts from anon;
revoke all on table public.translation_artifacts from authenticated;
grant select, insert, update, delete on table public.translation_artifacts to service_role;
```

## Artifact Repository Contract

New `server/artifacts.mjs` functions:

```ts
type ArtifactStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'canceled';

async function findSuccessfulTtsArtifact({
  jobId,
  clerkUserId,
  provider,
  model,
  voice,
  format,
  inputTextHash,
});

async function createOrMarkTtsArtifactRunning({
  jobId,
  clerkUserId,
  provider,
  model,
  voice,
  language,
  format,
  mimeType,
  inputTextHash,
  inputCharCount,
});

async function markTtsArtifactSucceeded({
  artifactId,
  clerkUserId,
  bucket,
  objectKey,
  byteSize,
  durationSeconds,
});

async function markTtsArtifactFailed({
  artifactId,
  clerkUserId,
  errorCode,
  errorMessage,
});

async function getEnglishTtsArtifactForUser({
  clerkUserId,
  translationId,
});
```

## Server Response Shape

`GET /v1/translations/:id` target:

```json
{
  "id": "translation-job-id",
  "status": "succeeded",
  "result": {
    "englishText": "Final translated English text"
  },
  "tts": {
    "status": "succeeded",
    "provider": "openai",
    "model": "gpt-4o-mini-tts",
    "voice": "marin",
    "language": "en",
    "format": "aac",
    "mimeType": "audio/aac",
    "byteSize": 123456,
    "durationSeconds": null,
    "audioUrl": "/v1/translations/translation-job-id/artifacts/english-audio",
    "errorCode": null,
    "errorMessage": null,
    "createdAt": "2026-05-21T00:00:00.000Z",
    "updatedAt": "2026-05-21T00:00:00.000Z"
  }
}
```

If TTS is disabled or not started:

```json
{
  "tts": null
}
```

If TTS failed:

```json
{
  "tts": {
    "status": "failed",
    "provider": "openai",
    "model": "gpt-4o-mini-tts",
    "voice": "marin",
    "errorCode": "openai_tts_failed",
    "errorMessage": "Speech generation failed."
  }
}
```

## Playback Route

Add:

```http
GET /v1/translations/:id/artifacts/english-audio
Authorization: Bearer <Clerk session token>
```

Behavior:

- Require Clerk session.
- Resolve `clerk_user_id` from the token.
- Fetch successful `english_tts_audio` artifact for that job and user.
- Return 404 if not found or not owned by the user.
- Download object from private Supabase Storage.
- Return bytes with `Content-Type` and `Content-Length`.
- Set conservative cache headers. MVP can use `Cache-Control: private, max-age=300`.

Errors:

```json
{ "error": "Audio artifact not found.", "traceId": "..." }
```

```json
{ "error": "Stored artifact download failed.", "traceId": "..." }
```

## Client Types

Add to `lib/types.ts`:

```ts
export interface TranslationTtsArtifact {
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'canceled' | string;
  provider?: string | null;
  model?: string | null;
  voice?: string | null;
  language?: string | null;
  format?: string | null;
  mimeType?: string | null;
  byteSize?: number | null;
  durationSeconds?: number | null;
  audioUrl?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
```

Attach to:

```ts
export interface TranslationResult {
  // existing fields
  tts?: TranslationTtsArtifact | null;
}

export interface TranslationHistoryDetail {
  // existing fields
  tts?: TranslationTtsArtifact | null;
}
```

## Logging

Allowed:

- `traceId`
- `jobId`
- `triggerRunId`
- provider
- operation
- model
- voice
- format
- input character count
- output byte count
- latency
- storage bucket/key prefix or object key if not user-facing logs
- sanitized error code/message

Forbidden:

- Full English translation text.
- Generated audio bytes/base64.
- OpenAI API key.
- Clerk session token.
- Supabase secret key.
