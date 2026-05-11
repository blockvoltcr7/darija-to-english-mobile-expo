# Task 02: Call Profile Upsert After Clerk Verification

## Type

Code

## Context

The mobile app already sends `Authorization: Bearer <Clerk session token>` through `lib/api.ts`, and `server/index.mjs` verifies it in `requireClerkSession` before provider calls. Epic 01 needs the server to create or load a Supabase profile immediately after Clerk verification so missed webhooks, delayed webhooks, and local webhook gaps do not block app-owned state.

This is the lazy safety-net path from the epic overview and `05-clerk-supabase-auth-solidification-plan.md`. It must preserve the current `/v1/translate-audio` response contract while preparing downstream Epic 02 jobs to use a profile/user ownership key.

## Implementation

- Add a small middleware or route-local helper in `server/index.mjs`, for example `ensureProfileForRequest`, that runs after `requireClerkSession`.
- Use `req.clerkAuth.userId` as the required Clerk ID and call `getOrCreateProfile` from the profile repository module.
- Attach the result to server-only request state, for example `req.profile = { id, clerkUserId }`; do not return the profile in the mobile response.
- Apply the middleware first to `POST /v1/translate-audio` and the legacy `/translate-audio` alias if it remains active.
- Keep the call before OpenAI, Modal, storage, Trigger.dev, or translation persistence work.
- Keep invalid-token behavior inside `requireClerkSession` so unauthorized requests fail before any DB write.

## Acceptance Criteria

- [ ] Invalid or missing Clerk tokens still return `401` before Supabase, OpenAI, or Modal calls.
- [ ] Valid Clerk-authenticated requests create or load exactly one `profiles` row keyed by `profiles.clerk_user_id`.
- [ ] The resolved profile ID or Clerk user key is available only on the server request context.
- [ ] The existing `/v1/translate-audio` JSON response shape is unchanged.
- [ ] The legacy `/translate-audio` alias has the same auth/profile behavior if it remains registered.
- [ ] Repeated calls by the same Clerk user do not create duplicate profile rows.

## Dependencies

- Depends On: add-profile-repository-helpers
- Blocks: verify-profile-sync-end-to-end

## Technical Notes

- Current route registration is in `server/index.mjs`: `app.post('/v1/translate-audio', requireClerkSession, handleTranslateAudio)` and `app.post('/translate-audio', requireClerkSession, handleTranslateAudio)`.
- Current auth state is set in `requireClerkSession` as `req.clerkAuth = { userId, sessionId }`.
- Preserve `server/AGENTS.md` pipeline ordering: auth and future entitlement/usage checks happen before paid provider calls.
- Do not create translation jobs, history APIs, or storage writes in this task; those belong to later epics.
- Live verification of the created profile row must use Supabase MCP with `project_id: npjsersrmvltoxmqdkzd`.

## Artifact Slots

- `artifacts/`: sanitized request traces, profile query output, and before/after response-shape notes.
- `references/`: authenticated sequence diagram and `server/index.mjs` route/auth references.
- `resources/`: authenticated curl examples that omit real Clerk tokens.
- `notes/`: decisions about middleware placement and request-context shape.
