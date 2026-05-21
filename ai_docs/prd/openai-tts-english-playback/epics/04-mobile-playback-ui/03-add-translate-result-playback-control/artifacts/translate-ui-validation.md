2026-05-21

Validation run:

```bash
npm run typecheck
```

Result: passed.

UI checks from code:

- `tts === null` renders no playback row.
- `tts.status === "queued" || "running"` renders compact preparing text.
- `tts.status === "succeeded"` renders Play/Pause with visible `AI-generated voice` disclosure.
- Failed TTS renders no primary audio control and leaves English text visible.
