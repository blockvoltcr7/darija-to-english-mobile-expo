# PRD And Code Anchors

## PRD Alignment

- `03-product-goals-success-metrics.md`: text translation remains visible when TTS fails.
- `10-risk-assessment.md`: TTS failure blocking translation is a high risk.
- `11-definition-of-done.md`: failure must be represented separately from successful text translation.

## Repo Anchors

- `server/translation-pipeline.mjs`: catches in `processStoredTranslationJob` currently fail the whole job; TTS-specific errors need local handling after text result persistence.
- `server/translations.mjs`: existing `safeErrorCode` and provider-run failure behavior show the safe error style.
- `server/artifacts.mjs`: failed artifact writes should use safe code/message fields.

## Execution Notes

- Catch provider/upload failures around the TTS branch only.
- Do not throw TTS failures past the point where they would call `markTranslationJobFailed` for a completed text result.
