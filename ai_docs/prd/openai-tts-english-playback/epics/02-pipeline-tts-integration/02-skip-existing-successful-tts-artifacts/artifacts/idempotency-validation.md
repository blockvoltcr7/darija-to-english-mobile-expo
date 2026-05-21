2026-05-21

Validation run:

```bash
node --check server/translation-pipeline.mjs
```

Static idempotency check:

- Pipeline computes `inputTextHash` from English text plus provider, model, voice, and format.
- Pipeline calls `findSuccessfulTtsArtifact(...)` before provider execution.
- Successful matching artifacts are reused without calling OpenAI.
- Repository/database uniqueness remains the retry-race backstop.
