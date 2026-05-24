2026-05-21

- Re-running a job with identical final English text and TTS config reuses a successful artifact.
- Changing text, provider, model, voice, or format changes the hash through `createTtsInputHash(...)`.
- Failed artifacts are not returned by `findSuccessfulTtsArtifact(...)`, so they cannot masquerade as successful playback.
- In a retry race, `createOrMarkTtsArtifactRunning(...)` can return a succeeded artifact created by another worker and the pipeline reuses it.
