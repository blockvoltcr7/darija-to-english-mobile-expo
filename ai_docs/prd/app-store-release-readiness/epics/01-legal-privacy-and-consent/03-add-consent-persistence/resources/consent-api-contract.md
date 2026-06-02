# Consent API Contract

This is an implementation guide, not execution evidence.

## Suggested Endpoints

```http
GET /v1/consents
Authorization: Bearer <Clerk session token>
```

Response:

```json
{
  "requiredVersion": "2026-05-24",
  "requiredTypes": [
    "privacy_policy",
    "terms_of_use",
    "third_party_ai_audio_processing"
  ],
  "accepted": [],
  "missing": [
    "privacy_policy",
    "terms_of_use",
    "third_party_ai_audio_processing"
  ]
}
```

```http
POST /v1/consents
Authorization: Bearer <Clerk session token>
Content-Type: application/json
```

Request:

```json
{
  "types": [
    "privacy_policy",
    "terms_of_use",
    "third_party_ai_audio_processing"
  ],
  "version": "2026-05-24",
  "source": "ios_app"
}
```

Response:

```json
{
  "status": "accepted",
  "version": "2026-05-24",
  "acceptedTypes": [
    "privacy_policy",
    "terms_of_use",
    "third_party_ai_audio_processing"
  ]
}
```

## Error Shape

Use the existing server pattern of safe JSON errors with a `traceId`.

```json
{
  "error": "Consent is required before audio processing.",
  "reason": "consent_required",
  "traceId": "..."
}
```

Do not include Clerk session tokens, policy drafts, audio contents, transcripts, or generated audio bytes in API responses.
