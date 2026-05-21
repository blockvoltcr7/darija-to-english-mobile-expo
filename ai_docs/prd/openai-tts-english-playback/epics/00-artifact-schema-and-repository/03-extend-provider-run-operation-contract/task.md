# Task 03: Extend Provider Run Operation Contract

## Type

Code

## Context

The PRD allows OpenAI TTS to be recorded as provider-run metadata if the current implementation tracks provider operations through `provider_runs`. This repo already records STT, consolidation, and translation provider metadata for diagnostics and operational visibility.

This task should make the smallest contract change needed for TTS metadata while avoiding unnecessary coupling between artifact lifecycle and provider-run diagnostics.

## Implementation

- Inspect `server/translations.mjs`, `server/translation-pipeline.mjs`, and any type/constants that define provider operations.
- Add an `openai_tts` or equivalent provider operation constant only if the implementation uses provider runs for TTS.
- Update database constraints or migrations if provider-run operation checks are enforced in SQL.
- Preserve existing provider-run behavior for OpenAI transcription, Modal ASR, consolidation, and translation.
- Document whether TTS artifact rows are the primary lifecycle source of truth and provider runs are diagnostic only.

## Acceptance Criteria

- [ ] Provider operation constants include a TTS operation when provider runs are used for TTS.
- [ ] SQL constraints, if present, accept the new operation without weakening existing checks.
- [ ] Existing translation provider-run writes continue to compile and behave unchanged.
- [ ] TTS lifecycle remains anchored in `translation_artifacts`, not only provider-run rows.

## Dependencies

- Depends On: add-artifact-repository-helpers
- Blocks: run-tts-after-translation-success

## Technical Notes

- This task may be a no-op in code if the implementation deliberately keeps TTS diagnostics only in `translation_artifacts`; capture that decision in `notes/`.
- Keep diagnostics safe: no full English translation text, provider secrets, generated audio bytes, or raw OpenAI response dumps in provider metadata.

## Artifact Slots

- `artifacts/`: contract diff notes or no-op decision record.
- `references/`: provider operation constants and migration snippets.
- `resources/`: SQL or API checks showing accepted provider operation values.
- `notes/`: source-of-truth decision for artifact lifecycle versus provider-run diagnostics.

