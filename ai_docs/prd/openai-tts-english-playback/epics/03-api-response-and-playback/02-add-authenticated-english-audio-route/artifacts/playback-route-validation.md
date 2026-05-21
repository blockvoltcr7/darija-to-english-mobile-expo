2026-05-21

Validation run:

```bash
node --check server/index.mjs
node --check server/artifacts.mjs
```

Route added:

```http
GET /v1/translations/:id/artifacts/english-audio
Authorization: Bearer <Clerk session token>
```

Headers on success:

```text
Content-Type: <artifact MIME type>
Content-Length: <downloaded byte count>
Cache-Control: private, max-age=300
```

Missing, non-owned, failed, and incomplete artifacts use:

```json
{ "error": "Audio artifact not found." }
```
