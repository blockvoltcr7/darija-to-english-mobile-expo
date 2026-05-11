# Phase 2 Verification - Clerk Webhook Endpoint

Task: `add-clerk-webhook-endpoint`

Documentation checked:

- Clerk `verifyWebhook()` reference: https://clerk.com/docs/reference/backend/verify-webhook
- Clerk database sync article with Express/raw-body guidance: https://clerk.com/articles/how-to-sync-clerk-user-data-to-your-database
- Clerk webhooks overview: https://clerk.com/docs/guides/development/webhooks/overview

Implementation verified:

- `POST /v1/webhooks/clerk` is registered with `express.raw({ type: 'application/json' })` before the global JSON parser.
- The route does not use `requireClerkSession`.
- The route verifies Clerk/Svix signature headers before trusting event data or writing to Supabase.
- `CLERK_WEBHOOK_SIGNING_SECRET` is backend-only and included in `.env.example`.
- `@clerk/backend` is a direct dependency for `@clerk/backend/webhooks`.
- `public.clerk_webhook_events.event_id` is used for idempotency.

Local invalid-signature check:

```text
POST /v1/webhooks/clerk without valid Svix headers
HTTP/1.1 400 Bad Request
{"error":"Invalid Clerk webhook signature."}
```

Signed local webhook replay check:

```text
created:           200 {"ok":true,"duplicate":false}
duplicate_created: 200 {"ok":true,"duplicate":true}
updated:           200 {"ok":true,"duplicate":false}
deleted:           200 {"ok":true,"duplicate":false}
```

Supabase MCP verification against project `npjsersrmvltoxmqdkzd`:

- `user.created`, `user.updated`, and `user.deleted` wrote processed rows to `public.clerk_webhook_events`.
- Duplicate `event_id` returned success without reprocessing.
- The test profile row was updated to the latest email/name/image and then soft-deleted.
- Disposable test rows were removed after verification.
- Cleanup check returned `profile_rows: 0` and `event_rows: 0` for the disposable Clerk user id.

Static checks:

```text
node --check server/env.mjs
node --check server/db.mjs
node --check server/profiles.mjs
node --check server/index.mjs
npm run typecheck
npm run lint
```
