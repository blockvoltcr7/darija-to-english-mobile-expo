# Task 02: Add Authenticated English Audio Route

## Type

Code

## Context

Generated audio is private user data. The mobile app should fetch audio through the local API with a Clerk bearer token, allowing the server to verify ownership before downloading bytes from Supabase Storage.

The target route is `GET /v1/translations/:id/artifacts/english-audio`.

## Implementation

- Add the authenticated playback route in `server/index.mjs`.
- Require Clerk session using the same auth boundary as translation detail/history routes.
- Resolve the current Clerk user and fetch only that user's successful `english_tts_audio` artifact for the requested translation ID.
- Return 404 when the artifact is missing, failed, incomplete, or owned by another user.
- Download the private object from Supabase Storage server-side.
- Return audio bytes with `Content-Type`, `Content-Length` when available, and `Cache-Control: private, max-age=300` or the chosen conservative cache header.
- Return sanitized JSON errors for missing artifact and storage download failure.

## Acceptance Criteria

- [ ] Route rejects unauthenticated requests.
- [ ] Route returns audio bytes only for the owning Clerk user.
- [ ] Route returns 404 for missing, non-owned, failed, or incomplete artifacts.
- [ ] Response headers match the stored MIME type and safe cache policy.
- [ ] Route does not expose private bucket/object key values in the public response.

## Dependencies

- Depends On: add-tts-detail-response-shape
- Depends On: 01-openai-tts-provider-and-storage/add-translation-artifact-storage-helpers
- Blocks: verify-owner-only-artifact-access
- Blocks: 04-mobile-playback-ui/add-authenticated-audio-playback-helper

## Technical Notes

- This route is the trust boundary for playback. Do not rely on the mobile app to hide or protect unauthorized URLs.
- Keep error responses consistent with existing API trace ID behavior.

## Artifact Slots

- `artifacts/`: curl playback checks, response headers, and sanitized error examples.
- `references/`: current auth route patterns in `server/index.mjs`.
- `resources/`: curl templates for owner, unauthenticated, and missing-artifact cases.
- `notes/`: cache header and error-shape decisions.

