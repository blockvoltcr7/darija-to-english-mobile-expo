# Translation Persistence Layer Contract

Target file:

```text
server/translations.mjs
```

Expected helper surface:

- `createTranslationJob({ clerkUserId, profileId, filename, audioBytes, traceId })`
- `markTranslationJobRunning({ jobId, clerkUserId })`
- `recordProviderRun({ jobId, clerkUserId, provider, operation, model, status, latencyMs, inputMetadata, outputMetadata, errorCode, errorMessage })`
- `writeTranslationResult({ jobId, clerkUserId, openaiArabicText, darijaArabicText, consolidatedArabicText, englishText, modelMetadata })`
- `markTranslationJobSucceeded({ jobId, clerkUserId })`
- `markTranslationJobFailed({ jobId, clerkUserId, errorCode, errorMessage })`

The exact signatures can be adjusted during implementation, but the route should not write directly to Supabase tables.

## Error Boundary

Repository errors should be explicit and safe to log. Follow the `ProfileRepositoryError` pattern from `server/profiles.mjs`.
