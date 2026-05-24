2026-05-21

Validation run:

```bash
node --check server/translation-pipeline.mjs
```

Static placement check:

- `writeTranslationResult(...)` remains before optional TTS execution.
- Optional TTS resolves server config and skips when disabled.
- Successful TTS creates or marks an artifact running, records `openai_tts` provider diagnostics, uploads generated audio, and marks the artifact succeeded.
- Translation job success remains controlled by the existing caller after pipeline completion.
