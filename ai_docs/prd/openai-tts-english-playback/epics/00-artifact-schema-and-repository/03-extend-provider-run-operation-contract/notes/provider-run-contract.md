2026-05-21

TTS artifact rows are the source of truth for generated audio lifecycle:

- `translation_artifacts.status` tracks queued, running, succeeded, failed, and canceled artifact state.
- `translation_artifacts` stores the private Storage bucket/object key and idempotency hash.
- `provider_runs.operation = 'openai_tts'` is allowed for safe diagnostics only. It must not become the playback authorization source or the only artifact lifecycle record.
