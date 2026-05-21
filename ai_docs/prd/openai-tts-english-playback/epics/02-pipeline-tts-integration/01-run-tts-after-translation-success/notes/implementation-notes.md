2026-05-21

- Added `runOptionalTtsForTranslation(...)` after `writeTranslationResult(...)`.
- TTS execution is gated by `ENABLE_TTS` through `resolveTtsConfig()`.
- Safe logs include job ID, artifact ID, provider, model, voice, format, input character count, and byte counts only.
- Full English text, generated audio bytes, provider secrets, and Clerk tokens are not logged.
