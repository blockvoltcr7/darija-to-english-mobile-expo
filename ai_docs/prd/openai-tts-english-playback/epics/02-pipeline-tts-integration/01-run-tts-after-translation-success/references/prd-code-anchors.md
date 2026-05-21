# PRD And Code Anchors

## PRD Alignment

- `05-architecture-plan.md`: TTS runs after English translation succeeds, behind `ENABLE_TTS`.
- `09-implementation-phases.md`: Phase 3 requires TTS after `writeTranslationResult(...)`.
- `11-definition-of-done.md`: text result must remain primary and audio generation must be idempotent.

## Repo Anchors

- `server/translation-pipeline.mjs`: `runTranslationProviderPipeline` writes the text result at `writeTranslationResult(...)` and marks job success later in `processStoredTranslationJob`.
- `trigger/translate-audio-job.mjs`: Trigger task should stay thin and continue delegating provider orchestration to the pipeline.
- `server/artifacts.mjs`, `server/tts/index.mjs`, `server/storage.mjs`: expected integration points from earlier epics.

## Execution Notes

- Add TTS after text persistence, not before consolidation or translation.
- TTS logs should include safe milestones only: job ID, status, format, byte counts, and provider/model.
