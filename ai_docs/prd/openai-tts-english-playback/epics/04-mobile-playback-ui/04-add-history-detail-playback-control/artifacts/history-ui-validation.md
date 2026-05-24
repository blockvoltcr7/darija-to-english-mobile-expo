2026-05-21

Validation run:

```bash
npm run typecheck
```

Result: passed.

UI checks from code:

- History list rows are unchanged.
- Detail view reuses `EnglishAudioPlayback` when `detail.tts.status === "succeeded"`.
- Missing/failed TTS does not hide historical English or Darija text.
- Playback hook cleanup prevents stale playback state when the row unmounts.
