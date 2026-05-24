2026-05-21

- Added `useAuthenticatedTtsPlayback(...)` in `lib/ttsPlayback.ts`.
- The hook exposes loading, playing, paused, idle, and error states.
- Playback starts only after explicit user tap.
- The hook does not log Clerk tokens, audio bytes, or private route internals.
- It pauses playback on unmount to avoid stale audio after navigation.
