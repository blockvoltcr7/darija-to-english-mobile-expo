# PRD And Code Anchors

## PRD Alignment

- `10-risk-assessment.md`: verifies the two highest-risk paths: TTS failure isolation and private audio exposure.
- `11-definition-of-done.md`: requires forced TTS failure and cross-user playback denial before release readiness.
- `03-product-goals-success-metrics.md`: confirms text translation remains visible when TTS fails.

## Repo Anchors

- `server/translation-pipeline.mjs`: TTS failure must not fail a completed text result.
- `server/index.mjs`: playback route should deny unauthenticated and cross-user access.
- `ai_docs/fresh-clerk-user-qa.md`: evidence rules and redaction boundaries.

## Execution Notes

- Prefer 404 for cross-user playback to avoid confirming artifact existence.
- Negative-path artifacts should include safe status/error summaries only.
