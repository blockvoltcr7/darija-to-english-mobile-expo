# PRD And Code Anchors

## PRD Alignment

- `03-product-goals-success-metrics.md`: reruns should not create duplicate TTS artifacts for the same text/provider config.
- `06-technical-specifications.md`: unique idempotency index is keyed by job, artifact kind, provider, model, voice, format, and input hash.
- `10-risk-assessment.md`: duplicate TTS generation is a high-cost retry risk.

## Repo Anchors

- `server/tts/index.mjs`: expected hash helper and feature gate.
- `server/artifacts.mjs`: expected `findSuccessfulTtsArtifact(...)` and lifecycle helpers.
- `server/translation-pipeline.mjs`: retry behavior must work in both Trigger and legacy synchronous route paths if both use the pipeline.

## Execution Notes

- Reuse only successful artifacts; failed or running artifacts need explicit handling.
- Keep database uniqueness and repository conflict handling aligned so retry races are safe.
