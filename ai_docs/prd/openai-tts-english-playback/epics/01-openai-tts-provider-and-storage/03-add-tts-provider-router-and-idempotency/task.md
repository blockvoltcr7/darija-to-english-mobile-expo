# Task 03: Add TTS Provider Router And Idempotency

## Type

Code

## Context

Pipeline code should not know provider-specific request details. A small `server/tts/index.mjs` module can own feature checks, format metadata, provider routing, and the idempotency hash derived from English text plus provider config.

## Implementation

- Add `server/tts/index.mjs`.
- Export supported output format metadata for `aac` and `mp3`.
- Export a stable hash helper using English text, provider, model, voice, and format.
- Export a generation function that checks `ENABLE_TTS`, validates provider config, and delegates to OpenAI for MVP.
- Keep the module extensible enough for future providers without adding unused abstraction.

## Acceptance Criteria

- [ ] `server/tts/index.mjs` exists and passes `node --check`.
- [ ] Idempotency hash changes when text, provider, model, voice, or format changes.
- [ ] `ENABLE_TTS=false` prevents provider calls.
- [ ] Unsupported providers or formats fail with safe server-side errors.
- [ ] The public API and mobile app never need direct provider config to request playback.

## Dependencies

- Depends On: add-openai-tts-provider
- Blocks: add-translation-artifact-storage-helpers
- Blocks: run-tts-after-translation-success

## Technical Notes

- The hash is a billing control: retries should not create duplicate paid calls for the same final text and config.
- Prefer deterministic serialization for hash input.

## Artifact Slots

- `artifacts/`: hash behavior examples and provider-router smoke output.
- `references/`: PRD idempotency rule and format map.
- `resources/`: sample hash inputs for regression checks.
- `notes/`: future-provider boundary notes.

