# Storage Metadata Migration Verification

Task: `add-storage-metadata-to-jobs`
Project ref: `npjsersrmvltoxmqdkzd`
Date: 2026-05-10

## Result

Added nullable rollout metadata columns to `public.translation_jobs`:

- `audio_bucket`
- `audio_object_key`
- `audio_size_bytes`
- `audio_mime_type`
- `audio_retention_expires_at`
- `audio_deleted_at`
- `artifact_bucket`
- `artifact_prefix`
- `artifacts_deleted_at`
- `trigger_run_id`

The migration is additive and safe for existing rows because all new columns are nullable. Check constraints only apply when the new metadata is present.

## Application Path

Supabase MCP migration tools were unavailable for this project in this session:

```text
MCP error -32600: You do not have permission to perform this action
```

The Supabase CLI was logged in and the repo was linked to `npjsersrmvltoxmqdkzd`.

Dry-run of `supabase db push` exposed pre-existing migration history drift:

```text
Remote migration versions not found in local migrations directory.
```

To avoid applying unrelated migrations with `--include-all`, this task applied only the new additive SQL file directly:

```bash
npx supabase db query --linked -f supabase/migrations/20260510222509_add_storage_metadata_to_translation_jobs.sql --output json
npx supabase migration repair --status applied 20260510222509
```

Pre-existing migration history drift remains for earlier epics and should be reconciled separately before relying on `supabase db push`.

## Schema Verification

Column verification query:

```sql
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'translation_jobs'
  and column_name in (
    'audio_bucket',
    'audio_object_key',
    'audio_size_bytes',
    'audio_mime_type',
    'audio_retention_expires_at',
    'audio_deleted_at',
    'artifact_bucket',
    'artifact_prefix',
    'artifacts_deleted_at',
    'trigger_run_id'
  )
order by column_name;
```

Sanitized result summary:

```text
10 expected columns present.
All expected columns are nullable.
Storage timestamps are timestamptz.
Audio size is integer.
Location, bucket, and size check constraints are present.
```

Constraint verification confirmed:

- `translation_jobs_audio_size_bytes_check`
- `translation_jobs_audio_location_check`
- `translation_jobs_audio_bucket_check`
- `translation_jobs_artifact_location_check`
- `translation_jobs_artifact_bucket_check`

## Repository Contract

`server/translations.mjs` now includes the storage and Trigger columns in the shared job selection list. It also exposes helper functions for later tasks:

- `updateTranslationJobStorageMetadata`
- `markTranslationJobAudioDeleted`
- `updateTranslationJobTriggerRunId`

These helpers keep `trigger_run_id` as execution metadata while Supabase `translation_jobs.status` remains the app source of truth.
