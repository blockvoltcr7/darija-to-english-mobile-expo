# Clerk Webhook Testing Guide

This guide verifies the Epic 01 profile-sync paths:

- signed Clerk webhook delivery to `POST /v1/webhooks/clerk`
- lazy authenticated API profile creation after `requireClerkSession`

Clerk remains the identity source. Supabase stores app profile rows keyed by
`profiles.clerk_user_id`.

## Required Environment

Backend-only local API variables:

```text
CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
CLERK_WEBHOOK_SIGNING_SECRET=...
SUPABASE_URL=https://npjsersrmvltoxmqdkzd.supabase.co
SUPABASE_SECRET_KEY=...
```

Do not create `EXPO_PUBLIC_*` variants for Clerk secret keys, Clerk webhook
secrets, Supabase secret keys, or Supabase service-role keys.

## Endpoint Contract

Webhook URL:

```text
POST /v1/webhooks/clerk
```

Subscribed Clerk events:

```text
user.created
user.updated
user.deleted
```

Expected success response:

```json
{ "ok": true, "duplicate": false }
```

Expected duplicate replay response:

```json
{ "ok": true, "duplicate": true }
```

Unsigned requests or requests with invalid Svix/Clerk signature headers should
return `400` before any Supabase writes. Missing
`CLERK_WEBHOOK_SIGNING_SECRET` should return a server configuration error before
any Supabase writes.

## Local Webhook Testing

1. Start the API:

   ```bash
   npm run api
   ```

2. Expose the local API with a tunnel supported by your Clerk workflow, such as
   ngrok, Cloudflare Tunnel, or another HTTPS tunnel:

   ```bash
   ngrok http 8787
   ```

3. In the Clerk Dashboard, create or update the webhook endpoint:

   ```text
   https://<tunnel-host>/v1/webhooks/clerk
   ```

4. Select these events:

   ```text
   user.created
   user.updated
   user.deleted
   ```

5. Copy the endpoint signing secret into the local API environment:

   ```text
   CLERK_WEBHOOK_SIGNING_SECRET=...
   ```

6. Restart the API after changing the secret.

7. Create a disposable Clerk user and confirm a `user.created` delivery returns
   `200`.

8. Edit that user's email/name/avatar fields and confirm `user.updated` returns
   `200`.

9. Delete the disposable Clerk user and confirm `user.deleted` returns `200`.

10. Replay one delivered webhook message from the Clerk Dashboard and confirm
    the API returns `duplicate: true`.

## Hosted Webhook Setup

For hosted or production testing, configure the Clerk endpoint URL to the hosted
API base URL:

```text
https://<api-host>/v1/webhooks/clerk
```

Set the signing secret only in the hosted backend environment:

```text
CLERK_WEBHOOK_SIGNING_SECRET=...
```

Do not put the signing secret in the mobile app, Expo public config, source
control, screenshots, or task artifacts.

## Invalid Signature Check

A normal curl request without valid Svix signature headers should fail:

```bash
curl -i -X POST http://localhost:8787/v1/webhooks/clerk \
  -H 'Content-Type: application/json' \
  --data '{"type":"user.created","data":{"id":"user_test"}}'
```

Expected response:

```text
HTTP/1.1 400 Bad Request
{"error":"Invalid Clerk webhook signature."}
```

This proves the route is not accepting arbitrary JSON as trusted Clerk events.

## Duplicate Replay Check

Use the Clerk Dashboard delivery/replay controls on the webhook endpoint:

1. Open the delivered message.
2. Replay the same message.
3. Confirm the API returns `200`.
4. Confirm the response includes `duplicate: true`.
5. Confirm the profile row count for the Clerk user remains `1`.
6. Confirm `public.clerk_webhook_events` has only one row for that `event_id`.

## Supabase MCP Verification

Use Supabase MCP only. Target project:

```text
project_id: npjsersrmvltoxmqdkzd
```

Confirm profile state after `user.created` or `user.updated`:

```sql
select
  clerk_user_id,
  primary_email,
  display_name,
  image_url,
  deleted_at is not null as soft_deleted
from public.profiles
where clerk_user_id = '<clerk_user_id>';
```

Confirm event idempotency:

```sql
select
  event_id,
  event_type,
  clerk_user_id,
  processed_at is not null as processed
from public.clerk_webhook_events
where event_id = '<svix_event_id>';
```

Confirm duplicate replay did not create multiple event rows:

```sql
select event_id, count(*) as row_count
from public.clerk_webhook_events
where event_id = '<svix_event_id>'
group by event_id;
```

Confirm `user.deleted` soft-deleted the profile:

```sql
select clerk_user_id, deleted_at is not null as soft_deleted
from public.profiles
where clerk_user_id = '<clerk_user_id>';
```

## Lazy Authenticated API Check

The mobile app sends:

```text
Authorization: Bearer <Clerk session token>
```

through `lib/api.ts` to:

```text
POST /v1/translate-audio
```

Expected behavior:

- missing or invalid Clerk tokens return `401`
- valid Clerk tokens create or load exactly one `profiles` row
- repeated requests for the same Clerk user do not create duplicate rows
- profile data is not added to the mobile translation response

Use Supabase MCP to verify:

```sql
select count(*) as row_count
from public.profiles
where clerk_user_id = '<clerk_user_id>';
```

## Cleanup

For disposable test users, prefer deleting the test user in Clerk first so a
real `user.deleted` webhook is delivered. After verification, remove disposable
test rows from Supabase only if they were created solely for testing:

```sql
delete from public.clerk_webhook_events
where clerk_user_id = '<test_clerk_user_id>';

delete from public.profiles
where clerk_user_id = '<test_clerk_user_id>';
```

Never delete real user rows as part of webhook testing.

## References

- Clerk `verifyWebhook()` reference: https://clerk.com/docs/reference/backend/verify-webhook
- Clerk webhook overview: https://clerk.com/docs/guides/development/webhooks/overview
- Clerk database sync article: https://clerk.com/articles/how-to-sync-clerk-user-data-to-your-database
