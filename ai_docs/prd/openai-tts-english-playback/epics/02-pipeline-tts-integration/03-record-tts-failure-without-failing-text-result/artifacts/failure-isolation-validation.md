2026-05-21

Validation run:

```bash
node --check server/translation-pipeline.mjs
```

Static failure-boundary check:

- Provider and upload failures are caught inside optional TTS execution.
- Artifact failure uses safe `error_code` and public-safe `error_message` values.
- The pipeline catches unrecorded optional TTS failures before returning the already-written text result.
- Text result persistence remains separate from generated audio artifact state.
