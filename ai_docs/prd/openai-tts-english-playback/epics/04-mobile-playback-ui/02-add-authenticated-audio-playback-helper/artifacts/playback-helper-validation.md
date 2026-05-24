2026-05-21

Validation run:

```bash
npm run typecheck
```

Result: passed.

Implementation decision:

- Expo Audio's source object supports request headers.
- The helper uses a fresh Clerk token and passes `Authorization: Bearer <token>` directly to the audio source.
- No temporary file path is needed for the MVP unless device playback QA shows header playback is unreliable.
