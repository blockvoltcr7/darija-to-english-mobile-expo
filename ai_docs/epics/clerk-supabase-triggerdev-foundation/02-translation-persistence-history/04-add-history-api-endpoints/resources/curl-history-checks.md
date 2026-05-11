# History Curl Checks

Replace placeholders before use. Do not save real bearer tokens in artifacts.

```bash
API_BASE_URL=http://localhost:8787
CLERK_TOKEN="<redacted>"
TRANSLATION_ID="<job-id>"
```

Unauthenticated list:

```bash
curl -i "$API_BASE_URL/v1/translations"
```

Authenticated list:

```bash
curl -i \
  -H "Authorization: Bearer $CLERK_TOKEN" \
  "$API_BASE_URL/v1/translations"
```

Authenticated detail:

```bash
curl -i \
  -H "Authorization: Bearer $CLERK_TOKEN" \
  "$API_BASE_URL/v1/translations/$TRANSLATION_ID"
```

Cross-user or missing detail should return `404`.
