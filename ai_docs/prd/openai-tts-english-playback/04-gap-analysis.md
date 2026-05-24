# 04 Gap Analysis

## Gap 1: Provider Operation Tracking

### Current Implementation

`server/translations.mjs` defines provider operations:

```js
export const PROVIDER_OPERATIONS = Object.freeze({
  OPENAI_TRANSCRIPTION: 'openai_transcription',
  MODAL_DARIJA_ASR: 'modal_darija_asr',
  OPENAI_CONSOLIDATION: 'openai_consolidation',
  OPENAI_TRANSLATION: 'openai_translation',
});
```

The migration check constraint only permits those operations.

### Target Implementation

Add TTS tracking:

```js
OPENAI_TTS: 'openai_tts'
```

Migration update:

```sql
alter table public.provider_runs
  drop constraint if exists provider_runs_operation_check,
  add constraint provider_runs_operation_check
    check (operation in (
      'openai_transcription',
      'modal_darija_asr',
      'openai_consolidation',
      'openai_translation',
      'openai_tts'
    ));
```

### Gaps

| Gap | Detail | Action |
| --- | --- | --- |
| Missing enum value | TTS cannot be recorded as a provider run. | Extend JS constants and SQL check constraint. |
| Metadata shape | Existing provider metadata assumes text/model calls. | Add safe TTS metadata: chars, format, bytes, voice, duration if measured. |
| Failure semantics | Provider run failure should not fail text result. | Record failed provider run and failed artifact status separately. |

## Gap 2: Artifact Persistence

### Current Implementation

`translation_jobs` has coarse artifact metadata:

```sql
artifact_bucket text,
artifact_prefix text,
artifacts_deleted_at timestamptz
```

No table tracks individual generated artifacts.

### Target Implementation

Create `translation_artifacts`.

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
  updated_at timestamptz not null default now()
);
```

### Gaps

| Gap | Detail | Action |
| --- | --- | --- |
| No per-artifact state | Cannot represent generated audio independently. | Add `translation_artifacts`. |
| No idempotency key | Cannot skip duplicate generation. | Add unique index on `job_id`, `kind`, `provider`, `model`, `voice`, `format`, `input_text_hash`. |
| No ownership row | Playback auth needs user/job ownership. | Duplicate `clerk_user_id` like `translation_results`. |

## Gap 3: Storage Upload Helpers

### Current Implementation

`server/storage.mjs` uploads original source audio only:

```js
export async function uploadOriginalAudioForJob({ clerkUserId, jobId, audio }) {
  // uploads to AUDIO_ORIGINALS_BUCKET
}
```

### Target Implementation

Add generated artifact helpers:

```js
export function buildTranslationArtifactObjectKey({
  clerkUserId,
  jobId,
  kind,
  provider,
  model,
  voice,
  extension,
});

export async function uploadTranslationArtifact({
  clerkUserId,
  jobId,
  kind,
  provider,
  model,
  voice,
  buffer,
  mimeType,
  extension,
});
```

### Gaps

| Gap | Detail | Action |
| --- | --- | --- |
| No artifact object key builder | Generated files need stable names and safe path segments. | Add helper using existing `safePathSegment` pattern. |
| No content-type mapping for generated output | OpenAI `aac` or `mp3` output needs MIME mapping. | Add generated audio MIME map. |
| No signed/authenticated retrieval | Mobile needs playback without raw storage credentials. | Add API download route. |

## Gap 4: API Response Contract

### Current Implementation

`toTranslationDetail(row)` returns `result` and `providerRuns`, but no `tts`.

### Target Implementation

Return:

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
    "audioUrl": "/v1/translations/<id>/artifacts/english-audio"
  }
}
```

### Gaps

| Gap | Detail | Action |
| --- | --- | --- |
| Missing relation query | Detail query does not include artifacts. | Extend `TRANSLATION_DETAIL_COLUMNS`. |
| Missing DTO mapping | Server does not normalize artifact rows. | Add `toTtsArtifactDetail`. |
| Missing download route | `audioUrl` needs authenticated target. | Add `GET /v1/translations/:id/artifacts/english-audio`. |

## Gap 5: Mobile Playback

### Current Implementation

`lib/types.ts` has text-only `TranslationResult` fields.

### Target Implementation

Add TTS metadata:

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
}
```

### Gaps

| Gap | Detail | Action |
| --- | --- | --- |
| No TTS type | UI cannot branch on audio status. | Extend `lib/types.ts`. |
| No client mapping | `lib/api.ts` ignores artifact metadata. | Map detail `tts` to result. |
| No player UI | User cannot play generated audio. | Add Play button with AI voice disclosure. |
