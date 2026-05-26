# Source Anchors

- `ai_docs/deployment/triggerdev.md`: current Development worker path, future production deploy command, correlation IDs, and troubleshooting.
- `ai_docs/deployment/production-api.md`: Trigger production dependency and API/worker environment alignment.
- `package.json`: `trigger:dev` and `trigger:deploy:prod` scripts.
- `trigger.config.mjs`: Trigger project ref, task directories, retry policy, and max duration.
- `trigger/translate-audio-job.mjs`: task id `translate-audio-job`, task payload, logging, and pipeline entry.
- `server/index.mjs`: `dispatchTranslationJob`, `triggerRunId` extraction, queue response, and `translation_jobs.trigger_run_id` update.
- `server/translation-pipeline.mjs`: stored-audio download, provider calls, translation, optional TTS, and final job status.
- `lib/api.ts` and `app/translate.tsx`: mobile polling diagnostics and `triggerRunId` surfacing.
