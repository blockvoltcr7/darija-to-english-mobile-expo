# Source Anchors

- `ai_docs/prd/app-store-release-readiness/06-technical-specifications.md`: usage controls and suggested quota response.
- `ai_docs/prd/app-store-release-readiness/10-risk-assessment.md`: Cloud Run request-size and provider-cost risks.
- `server/storage.mjs`: supported audio types, base64 validation, empty audio rejection, and `AUDIO_UPLOAD_MAX_BYTES` enforcement.
- `server/index.mjs`: payload validation, `express.json` body limit, async translation route, and error response behavior.
- `server/env.mjs`: `MAX_JSON_BODY_SIZE`, `AUDIO_UPLOAD_MAX_BYTES`, and retention env parsing.
- `lib/api.ts`: submit/poll client, error reading, token refresh, and diagnostics trace strings.
- `app/translate.tsx`: recording/upload UI, health check, error display, diagnostics, and result rendering.
- `lib/config.ts`: public mobile config surface.
