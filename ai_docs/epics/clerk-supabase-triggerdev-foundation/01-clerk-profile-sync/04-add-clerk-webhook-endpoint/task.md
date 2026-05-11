# Task 04: Add Clerk Webhook Endpoint

## Type

Code

## Context

Clerk lifecycle events happen outside Supabase Postgres, so profile sync must use a signed server webhook rather than database triggers. The webhook provides fast profile updates, while `call-profile-upsert-after-clerk-verification` remains the fallback for missed or delayed webhook deliveries.

This task wires the Express route, verifies Clerk webhook signatures, records idempotency events in Supabase, and calls the profile repository helpers from Task 01. It must not require an end-user Clerk session because Clerk, not a signed-in mobile client, is the caller.

## Implementation

- Add server env support in `server/env.mjs` and `.env.example` for `CLERK_WEBHOOK_SIGNING_SECRET`; keep it backend-only.
- Add the current Clerk-recommended webhook verification dependency or helper, such as Svix if still required by Clerk docs at implementation time.
- Register `POST /v1/webhooks/clerk` in `server/index.mjs` with raw-body parsing before the global JSON parser can alter the payload.
- Verify signature headers before trusting `event.id`, `event.type`, or `event.data`.
- For `user.created` and `user.updated`, record the event idempotently and call `upsertProfileFromClerkUser(event.data)`.
- For `user.deleted`, record the event idempotently and call `softDeleteProfile(event.data.id)`.
- Return success for already-processed duplicate events without applying duplicate profile mutations.

## Acceptance Criteria

- [ ] Unsigned webhooks, invalid signatures, and missing webhook secret configuration are rejected before DB writes.
- [ ] The route does not require `requireClerkSession` or an end-user Bearer token.
- [ ] Duplicate `event_id` values are handled idempotently and do not create duplicate profile rows.
- [ ] `user.created` and `user.updated` upsert `profiles` by `clerk_user_id`.
- [ ] `user.deleted` sets `profiles.deleted_at` through the profile helper.
- [ ] Logs include traceable event metadata but do not print webhook secrets, Clerk session tokens, or full sensitive payloads.

## Dependencies

- Depends On: add-profile-repository-helpers
- Depends On: create-clerk-webhook-events-migration
- Blocks: document-clerk-webhook-testing

## Technical Notes

- Current `server/index.mjs` applies `express.json({ limit: BODY_LIMIT })` globally; raw webhook verification must be registered before that middleware or otherwise preserve the exact raw body.
- Current env loader is `server/env.mjs`; add validation without exposing secret values through `/health`.
- `package.json` currently includes `@clerk/express` but not a dedicated webhook verification dependency; check current Clerk docs before adding one.
- Use `server/profiles.mjs` from Task 01 and `public.clerk_webhook_events` from Task 03.
- Any DB verification or event replay checks against production must use Supabase MCP with `project_id: npjsersrmvltoxmqdkzd`.
- Do not persist translation jobs or storage metadata in this task.

## Artifact Slots

- `artifacts/`: webhook request/response examples, invalid-signature output, duplicate-event output.
- `references/`: Clerk webhook docs link, authenticated sequence diagram, and event table migration notes.
- `resources/`: local signed webhook test payloads or replay commands with secrets removed.
- `notes/`: raw-body parsing, signature verification, and duplicate-event handling decisions.
