# Task 02: Port Provider Run And Result Writes

## Type

Code

## Context

Provider runs are the audit trail for OpenAI transcription, Modal ASR, consolidation, and translation. Result writes reconstruct the mobile response.

## Implementation

- Port `recordProviderRun` behavior to Convex.
- Port `writeTranslationResult` behavior to Convex.
- Preserve safe metadata sanitization.
- Preserve operation names and provider names.
- Mark succeeded only after result write succeeds.

## Acceptance Criteria

- Every provider step records status, latency, model, and safe metadata.
- Failed provider steps record safe error code/message.
- Final result contains raw OpenAI, raw Darija, consolidated Darija, English translation, and model metadata.
- Mobile response can be reconstructed from Convex rows.

## Dependencies

- `port-worker-job-claiming`

## Validation Commands

```bash
node --check server/translation-pipeline.mjs
npm run typecheck
npm run lint
```

## Artifact Slots

- `artifacts/`: provider run parity sample.
- `notes/`: metadata redaction review.

