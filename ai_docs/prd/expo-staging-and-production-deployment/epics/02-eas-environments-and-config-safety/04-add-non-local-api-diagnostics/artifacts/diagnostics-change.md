# Non-Local API Diagnostics Change

Timestamp: `2026-05-14T04:24:00Z`

## Changed Files

- `app/translate.tsx`

## Behavior

The translate screen now derives an API target label from `CONFIG.API_BASE_URL`:

- Local hosts `localhost`, `127.0.0.1`, and `10.0.2.2` display as `Local API`.
- Other parseable URLs display as `Staging API`.
- Invalid URLs display a parseability warning.

The active API base URL remains visible in the header chip. When a local URL is configured, the screen shows a warning that physical preview and staging builds need an HTTPS API URL. The same information is appended to the existing diagnostics panel on screen load.

## Validation

Run:

```bash
npm run typecheck
npm run lint
```
