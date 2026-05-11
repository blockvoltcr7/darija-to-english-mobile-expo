# History API Contract

## List

```text
GET /v1/translations
Authorization: Bearer <Clerk session token>
```

Recommended response:

```json
{
  "items": [
    {
      "id": "translation-job-id",
      "status": "succeeded",
      "filename": "recording.m4a",
      "createdAt": "2026-05-10T00:00:00.000Z",
      "completedAt": "2026-05-10T00:00:10.000Z",
      "consolidatedArabicPreview": "Short preview",
      "englishPreview": "Short preview",
      "models": {
        "openaiTranscription": "gpt-4o-mini-transcribe",
        "darija": "modal-darija-model",
        "consolidation": "gpt-5.5",
        "translation": "gpt-5.5"
      }
    }
  ],
  "nextCursor": null
}
```

## Detail

```text
GET /v1/translations/:id
Authorization: Bearer <Clerk session token>
```

Recommended response:

```json
{
  "id": "translation-job-id",
  "status": "succeeded",
  "filename": "recording.m4a",
  "createdAt": "2026-05-10T00:00:00.000Z",
  "completedAt": "2026-05-10T00:00:10.000Z",
  "result": {
    "openaiArabicText": "...",
    "darijaArabicText": "...",
    "consolidatedArabicText": "...",
    "englishText": "..."
  },
  "providerRuns": []
}
```

Missing or cross-user ids should return `404`.
