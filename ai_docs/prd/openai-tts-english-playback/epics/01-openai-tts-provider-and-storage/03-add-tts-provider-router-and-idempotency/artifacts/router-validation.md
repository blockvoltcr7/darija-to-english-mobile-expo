2026-05-21

Validation run:

```bash
node --check server/tts/index.mjs
```

Smoke checks:

- Hash changed when English text changed.
- Hash changed when provider changed.
- Hash changed when model changed.
- Hash changed when voice changed.
- Hash changed when format changed.
- `ENABLE_TTS=false` path returned `skipped: true` with `reason: "tts_disabled"` and made no provider call.
- Unsupported provider and unsupported format produced safe server-side errors.
