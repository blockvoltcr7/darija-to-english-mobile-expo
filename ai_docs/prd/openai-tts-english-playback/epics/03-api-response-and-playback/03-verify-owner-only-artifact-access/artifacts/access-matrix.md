2026-05-21

Static access-control matrix:

| Case | Expected Result | Implemented Boundary |
| --- | --- | --- |
| No Clerk token | `401` | `requireClerkSession` on playback route |
| Owner token + succeeded artifact | `200` audio bytes | `getEnglishTtsArtifactForUser` filters by `job_id`, `clerk_user_id`, kind, and `status = 'succeeded'` |
| Second user token | `404` | owner-filtered lookup returns no row |
| Missing artifact | `404` | no successful artifact row |
| Failed/running artifact | `404` | successful-artifact helper filters out non-succeeded statuses |

Runtime owner/cross-user checks still require real Clerk tokens and generated non-sensitive test audio.

Local route check:

```bash
PORT=8799 HOST=127.0.0.1 node server/index.mjs
curl -i --max-time 5 http://127.0.0.1:8799/v1/translations/example/artifacts/english-audio
```

Observed unauthenticated response:

```text
HTTP/1.1 401 Unauthorized
{"error":"Unauthorized","traceId":"server-mpfz7fbk","reason":"clerk_session_missing"}
```
