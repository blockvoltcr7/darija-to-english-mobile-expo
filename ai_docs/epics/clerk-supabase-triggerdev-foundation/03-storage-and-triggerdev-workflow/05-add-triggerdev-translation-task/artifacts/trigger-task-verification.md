# Trigger Translation Task Verification

Task: `add-triggerdev-translation-task`
Date: 2026-05-10

## Result

Added Trigger.dev task:

- File: `trigger/translate-audio-job.mjs`
- Task ID: `translate-audio-job`
- Payload schema: strict `{ job_id: uuid }`
- Max duration: 900 seconds
- Retry attempts: 2

The task payload contains only a Supabase job ID. It does not accept raw audio, Clerk tokens, headers, provider secrets, or base64 payloads.

## Shared Pipeline

Extracted provider processing into `server/translation-pipeline.mjs`:

- Modal Darija ASR
- OpenAI transcription
- OpenAI consolidation
- OpenAI translation
- provider run persistence
- result persistence
- sanitized failure handling

The existing sync API route now calls `runTranslationProviderPipeline`, and the Trigger task calls `processStoredTranslationJob`.

## Worker Flow

`processStoredTranslationJob`:

1. Atomically claims only a `queued` job by moving it to `running`.
2. Skips expensive provider work for already `running` or `succeeded` jobs.
3. Requires `audio_bucket` and `audio_object_key`.
4. Downloads original audio through the private Supabase Storage API.
5. Runs the shared provider pipeline.
6. Writes provider runs and final result using Epic 02 repository conventions.
7. Marks the job `succeeded` or writes safe `failed` fields.

## Validation

Commands run:

```bash
node --check server/translation-pipeline.mjs
node --check server/index.mjs
node --check server/translations.mjs
node --check trigger/translate-audio-job.mjs
npm run typecheck
npm run lint
npx trigger.dev deploy --dry-run --config trigger.config.mjs --env prod --skip-update-check
```

Trigger.dev dry-run result:

```text
Successfully built code
Dry run complete
```

No task was deployed in this phase. Runtime dispatch and `trigger_run_id` storage are owned by `dispatch-triggerdev-from-api`.
