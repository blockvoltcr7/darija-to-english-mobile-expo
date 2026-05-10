# Phase 2 Verification - Authenticated Profile Upsert

Task: `call-profile-upsert-after-clerk-verification`

Implementation verified:

- `POST /v1/translate-audio` now runs `requireClerkSession`, then `ensureProfileForRequest`, then `handleTranslateAudio`.
- Legacy `POST /translate-audio` uses the same middleware chain.
- `ensureProfileForRequest` calls `getOrCreateProfile({ clerkUserId: req.clerkAuth.userId })`.
- The resolved profile is attached to server-only request state as `req.profile`.
- The mobile response shape is unchanged because `req.profile` is not added to the response payload.

Local route behavior checked:

```text
POST /v1/translate-audio without a Clerk Bearer token
HTTP/1.1 401 Unauthorized
{"error":"Unauthorized"}
```

This confirms missing/invalid auth fails before the new profile middleware and before provider calls.

Static checks:

```text
node --check server/env.mjs
node --check server/db.mjs
node --check server/profiles.mjs
node --check server/index.mjs
npm run typecheck
npm run lint
```

Notes:

- A live valid-Clerk-token request is still part of the Epic 01 end-to-end QA gate in Task 06.
- Supabase checks use production project `npjsersrmvltoxmqdkzd`.
