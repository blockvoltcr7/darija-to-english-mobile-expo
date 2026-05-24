2026-05-21

Validation run:

```bash
node --check server/index.mjs
node --check server/artifacts.mjs
```

Sanitized response shapes:

```json
{ "tts": null }
```

```json
{
  "tts": {
    "status": "succeeded",
    "provider": "openai",
    "model": "gpt-4o-mini-tts",
    "voice": "marin",
    "language": "en",
    "format": "aac",
    "mimeType": "audio/aac",
    "byteSize": 12345,
    "durationSeconds": null,
    "audioUrl": "/v1/translations/<translation-id>/artifacts/english-audio",
    "errorCode": null,
    "errorMessage": null
  }
}
```

```json
{
  "tts": {
    "status": "failed",
    "provider": "openai",
    "model": "gpt-4o-mini-tts",
    "voice": "marin",
    "errorCode": "openai_tts_failed",
    "errorMessage": "Speech generation failed.",
    "audioUrl": null
  }
}
```

Private bucket names and object keys are intentionally absent from the public detail shape.
