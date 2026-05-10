# Epic 01 Final QA Summary

Task: `verify-profile-sync-end-to-end`

Target project:

- Supabase MCP project id: `npjsersrmvltoxmqdkzd`

## Static Checks

Passed:

```text
node --check server/env.mjs
node --check server/db.mjs
node --check server/profiles.mjs
node --check server/index.mjs
npm run typecheck
npm run lint
npx expo-doctor
```

Expo Doctor result:

```text
18/18 checks passed. No issues detected.
```

## Health Checks

Local API was started on a temporary port.

```text
GET /health
ok: true
dependencies.clerk: true
dependencies.supabase: true
models.openai_transcription: gpt-4o-mini-transcribe
models.consolidation: gpt-5.5
models.translation: gpt-5.5
```

```text
GET /health/supabase
ok: true
projectRef: npjsersrmvltoxmqdkzd
table: profiles
status: 200
rowCount: 0
```

## Lazy Authenticated API Upsert

Used Clerk's documented testing flow:

1. Create a disposable Clerk user through the Backend API.
2. Create a session for the user.
3. Create a short-lived session token.
4. Send the token as `Authorization: Bearer <session_token>`.

The test request intentionally sent an invalid translation payload so the route
would stop at payload validation after profile upsert and before provider calls.

Result:

```text
first authenticated request:  400 {"error":"filename is required."}
second authenticated request: 400 {"error":"filename is required."}
```

Supabase MCP verification:

```text
profiles row count for disposable Clerk user: 1
```

Cleanup:

```text
disposable Clerk session revoked
disposable Clerk user deleted
disposable Supabase profile row deleted
post-cleanup profile row count: 0
```

## Signed Clerk Webhook Sync

Used a fake local webhook signing secret and locally signed webhook payloads.
No real Clerk webhook secret was printed or committed.

Results:

```text
user.created:           200 {"ok":true,"duplicate":false}
duplicate user.created: 200 {"ok":true,"duplicate":true}
user.updated:           200 {"ok":true,"duplicate":false}
user.deleted:           200 {"ok":true,"duplicate":false}
```

Supabase MCP verification:

```text
public.clerk_webhook_events contained one processed row for each event id.
public.profiles reflected the updated email/name/image.
public.profiles.deleted_at was set after user.deleted.
```

Cleanup:

```text
disposable webhook event rows deleted
disposable profile row deleted
post-cleanup profile_rows: 0
post-cleanup event_rows: 0
```

## Security Advisor Notes

Expected info lints:

- `public.profiles` has RLS enabled and no policies.
- `public.clerk_webhook_events` has RLS enabled and no policies.

These are expected in the current server-mediated architecture because the app
does not expose direct mobile Supabase table access.

Existing unrelated warnings remain:

- `public.rls_auto_enable()` can be executed by `anon`.
- `public.rls_auto_enable()` can be executed by `authenticated`.

## Documentation References

- Clerk testing overview: https://clerk.com/docs/guides/development/testing/overview
- Clerk `verifyWebhook()` reference: https://clerk.com/docs/reference/backend/verify-webhook
- Clerk webhook overview: https://clerk.com/docs/guides/development/webhooks/overview
- Supabase RLS docs: https://supabase.com/docs/guides/database/postgres/row-level-security
