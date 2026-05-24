2026-05-21

- Added `server/tts/index.mjs`.
- The router owns TTS output format metadata for `aac` and `mp3`.
- `createTtsInputHash` uses deterministic serialization and SHA-256 over English text plus provider, model, voice, and format.
- `generateTtsAudio` returns a skipped result while TTS is disabled, preventing provider calls without exposing provider config to API or mobile callers.
- Future providers can be added at the router boundary without changing public mobile request contracts.
