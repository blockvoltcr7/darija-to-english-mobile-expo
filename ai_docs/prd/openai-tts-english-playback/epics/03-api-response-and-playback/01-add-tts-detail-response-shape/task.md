# Task 01: Add TTS Detail Response Shape

## Type

Code

## Context

The mobile app polls `GET /v1/translations/:id` for result status. Once TTS artifact metadata exists, the detail response should include a `tts` field that tells the app whether audio is unavailable, preparing, succeeded, or failed.

The response must expose only safe metadata and an authenticated playback route, not private storage object keys.

## Implementation

- Update `server/translations.mjs` and/or `server/index.mjs` to fetch the relevant English TTS artifact for the authenticated user.
- Add `toTtsArtifactDetail(...)` in `server/index.mjs` or a similarly scoped mapper.
- Add `tts` to `toTranslationDetail(...)`.
- Return `tts: null` when TTS is disabled, not started, or unavailable.
- For succeeded artifacts, include `status`, provider/model/voice/language/format, `mimeType`, `byteSize`, optional duration, safe timestamps, and `audioUrl`.
- For failed artifacts, include safe error code/message without stack traces.

## Acceptance Criteria

- [ ] `GET /v1/translations/:id` includes `tts` metadata for the authenticated owner when available.
- [ ] Response never includes Supabase service credentials, bucket object keys, or signed/public storage URLs.
- [ ] `tts.audioUrl` points to `/v1/translations/:id/artifacts/english-audio` for succeeded artifacts.
- [ ] Failed TTS status is represented without hiding text translation fields.
- [ ] Existing legacy result aliases remain intact.

## Dependencies

- Depends On: 02-pipeline-tts-integration/record-tts-failure-without-failing-text-result
- Blocks: add-authenticated-english-audio-route
- Blocks: 04-mobile-playback-ui/add-client-tts-types-and-api-mapping

## Technical Notes

- Prefer server-side mapping near the existing translation detail mapper so old UI fields and new `tts` fields stay consistent.
- Keep `audioUrl` relative unless the existing API client convention requires absolute URLs.

## Artifact Slots

- `artifacts/`: sample sanitized JSON for null, succeeded, and failed TTS states.
- `references/`: `06-technical-specifications.md` response shape and current detail mapper.
- `resources/`: curl examples for authenticated detail checks.
- `notes/`: response compatibility decisions.

