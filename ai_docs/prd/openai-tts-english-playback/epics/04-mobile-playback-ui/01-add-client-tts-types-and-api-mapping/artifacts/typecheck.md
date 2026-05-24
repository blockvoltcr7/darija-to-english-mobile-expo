2026-05-21

Validation run:

```bash
npm run typecheck
```

Result: passed.

Mapping notes:

- `TranslationTtsArtifact` represents null, queued/running, succeeded, failed, and canceled states.
- `lib/api.ts` normalizes `detail.tts || null`.
- Relative `audioUrl` values are resolved against `CONFIG.API_BASE_URL`.
- Existing translation aliases and model metadata mapping are unchanged.
