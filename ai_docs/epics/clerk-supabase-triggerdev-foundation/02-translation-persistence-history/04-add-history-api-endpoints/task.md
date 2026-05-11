# Task 04: Add History API Endpoints

## Type

Code

## Context

Once synchronous translations are persisted, users need a server-mediated way to list and reopen their own history. The mobile app must continue to talk to the Express API with a Clerk token; it must not query Supabase directly. These endpoints are the API contract that the minimal history UI will consume.

## Implementation

- Add `GET /v1/translations` and `GET /v1/translations/:id` to `server/index.mjs`.
- Protect both endpoints with `requireClerkSession`; profile upsert is optional for reads unless a writer/helper requires `req.profile`.
- Add read helpers to `server/translations.mjs`, for example `listTranslationsForUser({ clerkUserId, limit, cursor })` and `getTranslationForUser({ clerkUserId, translationId })`.
- Filter every query by `clerk_user_id = req.clerkAuth.userId`; cross-user detail access should return `404`, not a distinguishable authorization leak.
- Return a compact list payload with stable fields for mobile: id, status, created/completed timestamps, filename, transcript/translation previews, model metadata, and pagination cursor if implemented.
- Return detail payload with full transcripts, English translation, result metadata, and safe provider-run summaries.

## Acceptance Criteria

- [ ] `GET /v1/translations` returns `401` without a valid Clerk session.
- [ ] `GET /v1/translations/:id` returns `401` without a valid Clerk session.
- [ ] List responses contain only rows for the authenticated `clerk_user_id`.
- [ ] Detail responses return `404` for missing or cross-user ids.
- [ ] Response shapes are documented in this task's `references/` or `artifacts/`.

## Dependencies

- Depends On: `persist-sync-translation-results`
- Blocks: `add-mobile-history-surface`
- Blocks: `verify-history-access-controls`

## Technical Notes

- Existing auth middleware is in `server/index.mjs` at `requireClerkSession`.
- Keep endpoint names versioned under `/v1/`; do not add unversioned history routes unless needed for backward compatibility.
- Bound `limit` to a safe maximum such as 50 and default to a small recent-history page.
- Do not return provider raw request/response payloads, stack traces, API keys, bearer tokens, or audio base64.
- If `translation_results` is missing for an in-progress or failed job, the detail endpoint should still return the job status and safe error fields.

## Artifact Slots

- `artifacts/`: list/detail response examples and 401/404 examples.
- `references/`: API contract notes.
- `resources/`: curl command templates.
- `notes/`: pagination and response-shape decisions.
