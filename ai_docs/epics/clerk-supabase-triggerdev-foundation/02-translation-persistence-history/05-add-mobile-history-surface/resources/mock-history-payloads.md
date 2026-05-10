# Mock History Payloads

Use these only for UI state shaping before the API is available.

## Empty

```json
{
  "items": [],
  "nextCursor": null
}
```

## List Item

```json
{
  "id": "job_123",
  "status": "succeeded",
  "filename": "recording.m4a",
  "createdAt": "2026-05-10T00:00:00.000Z",
  "completedAt": "2026-05-10T00:00:08.000Z",
  "englishPreview": "The speaker is requesting administrative documents...",
  "consolidatedArabicPreview": "Synthetic Darija preview..."
}
```

## Error

```json
{
  "error": "Unauthorized"
}
```
