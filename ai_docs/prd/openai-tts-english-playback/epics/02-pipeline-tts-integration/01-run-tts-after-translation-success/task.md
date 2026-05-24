# Task 01: Run TTS After Translation Success

## Type

Code

## Context

The current Trigger worker calls `server/translation-pipeline.mjs` to run OpenAI STT, Modal Darija ASR, consolidation, translation, and result persistence. TTS must run only after the English translation result has been written, because audio generation depends on final English text and must not replace the text result as the primary value.

## Implementation

- Update `server/translation-pipeline.mjs` to invoke TTS only after `writeTranslationResult(...)` succeeds.
- Use the TTS router to respect `ENABLE_TTS`.
- Use artifact repository helpers to create or mark an artifact as running before the provider call.
- Upload generated audio through `server/storage.mjs`.
- Mark the artifact succeeded with bucket, object key, byte size, MIME type, and safe completion metadata.
- Return TTS metadata from the pipeline only if it is useful for the synchronous legacy route.

## Acceptance Criteria

- [ ] `ENABLE_TTS=false` leaves the existing text pipeline behavior unchanged.
- [ ] `ENABLE_TTS=true` runs TTS after text result persistence, not before.
- [ ] Successful TTS creates a `translation_artifacts` row and uploads audio to private storage.
- [ ] Trigger job still marks the translation job succeeded when text translation succeeds.
- [ ] Logs include safe TTS milestones but not full text, audio bytes, or secrets.

## Dependencies

- Depends On: 01-openai-tts-provider-and-storage/add-translation-artifact-storage-helpers
- Depends On: 00-artifact-schema-and-repository/extend-provider-run-operation-contract
- Blocks: skip-existing-successful-tts-artifacts

## Technical Notes

- Keep text translation state and TTS artifact state separate. The completed translation job should not become failed due to an audio enhancement problem.
- Use `clerk_user_id` from the existing job/pipeline context when creating artifacts.

## Artifact Slots

- `artifacts/`: sanitized Trigger run notes showing text success plus TTS artifact creation.
- `references/`: current `server/translation-pipeline.mjs` flow and PRD architecture plan.
- `resources/`: sample Trigger payload and safe log checklist.
- `notes/`: placement decision for TTS relative to `writeTranslationResult(...)`.

