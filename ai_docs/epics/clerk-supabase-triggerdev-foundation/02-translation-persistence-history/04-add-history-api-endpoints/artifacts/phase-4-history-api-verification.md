# Phase 4 History API Verification

## Scope

- Task: `add-history-api-endpoints`
- New routes:
  - `GET /v1/translations`
  - `GET /v1/translations/:id`
- Repository reads:
  - `listTranslationsForUser`
  - `getTranslationForUser`

## Access Control Shape

- Both endpoints use `requireClerkSession`.
- List queries filter by `clerk_user_id = req.clerkAuth.userId`.
- Detail queries filter by both `id` and `clerk_user_id`.
- Missing or cross-user detail rows return `404` from the route.
- Provider run responses expose safe summary fields only, not raw input/output metadata.

## Response Contracts

List response:

```json
{
  "items": [],
  "nextCursor": null
}
```

Detail response:

```json
{
  "id": "translation-job-id",
  "status": "succeeded",
  "filename": "recording.m4a",
  "sourceAudioBytes": 12345,
  "traceId": "trace-id",
  "errorCode": null,
  "errorMessage": null,
  "createdAt": "2026-05-10T00:00:00.000Z",
  "updatedAt": "2026-05-10T00:00:00.000Z",
  "startedAt": "2026-05-10T00:00:00.000Z",
  "completedAt": "2026-05-10T00:00:00.000Z",
  "result": {
    "openaiArabicText": "...",
    "darijaArabicText": "...",
    "consolidatedArabicText": "...",
    "englishText": "...",
    "modelMetadata": {},
    "createdAt": "2026-05-10T00:00:00.000Z",
    "updatedAt": "2026-05-10T00:00:00.000Z"
  },
  "providerRuns": []
}
```

## Validation

- `node --check server/index.mjs && node --check server/translations.mjs`: passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `git diff --check`: passed.
- `curl -i http://localhost:8787/v1/translations`: returned `401 Unauthorized`.
- `curl -i http://localhost:8787/v1/translations/00000000-0000-0000-0000-000000000000`: returned `401 Unauthorized`.
- `curl -i http://localhost:8787/health`: returned `200 OK` and included `models.openai_transcription`, `models.consolidation`, and `models.translation`.

## Deferred QA

- Authenticated own-row list/detail and cross-user `404` checks are deferred to `verify-history-access-controls`, where Clerk session tokens and QA fixture cleanup are handled together.
