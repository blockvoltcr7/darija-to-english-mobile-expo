# Task 03: Verify Owner-Only Artifact Access

## Type

Code

## Context

The playback route is security-sensitive because it serves private generated audio bytes. This task verifies the negative paths before mobile UI work relies on the endpoint.

## Implementation

- Create a focused manual or scripted check matrix for playback access.
- Verify owner access succeeds with a valid Clerk bearer token for the artifact owner.
- Verify unauthenticated access is rejected.
- Verify a second signed-in user receives 404 for another user's artifact.
- Verify missing/failed/incomplete artifacts return safe 404 responses.
- Verify response bodies and logs do not expose private object keys, tokens, provider secrets, or audio bytes.

## Acceptance Criteria

- [ ] Owner can fetch the generated audio bytes.
- [ ] Unauthenticated requests cannot fetch audio.
- [ ] Cross-user requests cannot infer or fetch another user's generated audio.
- [ ] Missing and failed artifact states produce safe public errors.
- [ ] Evidence is captured without copying private audio contents or tokens.

## Dependencies

- Depends On: add-authenticated-english-audio-route
- Blocks: 04-mobile-playback-ui/add-authenticated-audio-playback-helper

## Technical Notes

- Treat 404 for cross-user access as intentional to avoid confirming the existence of another user's artifact.
- Keep test fixtures non-sensitive and document only filename/size when needed.

## Artifact Slots

- `artifacts/`: owner/cross-user/missing-artifact verification notes.
- `references/`: playback route implementation and API auth conventions.
- `resources/`: curl templates with placeholder tokens only.
- `notes/`: access-control findings and any blockers.

