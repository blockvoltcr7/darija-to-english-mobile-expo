# Task 02: Add Authenticated Audio Playback Helper

## Type

Code

## Context

The playback route requires `Authorization: Bearer <Clerk session token>`. If the chosen Expo playback API cannot attach request headers directly, the app should fetch audio bytes with auth, write a temporary local file, and play that file.

## Implementation

- Inspect the installed Expo audio/filesystem packages and current media patterns.
- Add a helper for authenticated TTS playback that obtains a fresh Clerk session token before fetching.
- If direct header playback is supported, use it with the authenticated route.
- If direct header playback is not supported, fetch bytes with `Authorization`, write a temporary local file, and play from that local URI.
- Track loading, playing, paused, stopped, and error states in a reusable shape for screens.
- Clean up temporary files or playback handles where the selected API requires it.

## Acceptance Criteria

- [ ] Playback requests include a fresh Clerk bearer token.
- [ ] Helper can play a successful audio artifact URL returned by the API.
- [ ] Helper exposes enough state for Play/Pause UI.
- [ ] Failed fetch or playback errors do not crash the screen or hide text translation.
- [ ] No auth token, audio bytes, or private URL internals are logged.

## Dependencies

- Depends On: add-client-tts-types-and-api-mapping
- Depends On: 03-api-response-and-playback/verify-owner-only-artifact-access
- Blocks: add-translate-result-playback-control

## Technical Notes

- Prefer the smallest helper that supports both result and history detail screens.
- Do not autoplay after fetch. Playback must start from explicit user action.

## Artifact Slots

- `artifacts/`: simulator playback notes and error-state screenshots if useful.
- `references/`: installed Expo audio/filesystem API usage and existing Clerk token retrieval.
- `resources/`: local non-sensitive audio response fixture notes.
- `notes/`: direct-header versus temporary-file playback decision.

