# PRD And Code Anchors

## PRD Alignment

- `03-product-goals-success-metrics.md`: idempotency prevents repeated paid TTS calls during retries and polling.
- `06-technical-specifications.md`: defines supported formats and the idempotency inputs.
- `10-risk-assessment.md`: duplicate generation is a high-risk cost issue.

## Repo Anchors

- `server/tts/openai-tts.mjs`: expected provider-specific module from the previous task.
- `server/env.mjs`: source for feature flag and provider config.
- `server/artifacts.mjs`: downstream repository uses the generated hash to find and persist artifacts.

## Execution Notes

- Use deterministic serialization before hashing text and provider config.
- `ENABLE_TTS=false` should return a clean skipped state and must not call OpenAI.
