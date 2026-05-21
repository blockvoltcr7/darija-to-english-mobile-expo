# PRD And Code Anchors

## PRD Alignment

- `06-technical-specifications.md`: defines `GET /v1/translations/:id/artifacts/english-audio`, owner checks, content headers, and error shapes.
- `10-risk-assessment.md`: private audio exposure is a high-risk trust-boundary issue.
- `11-definition-of-done.md`: playback route must return bytes only to the owning Clerk user.

## Repo Anchors

- `server/index.mjs`: use existing `requireClerkSession`, trace ID, and route error patterns.
- `server/artifacts.mjs`: fetch the successful owner-owned `english_tts_audio` artifact.
- `server/storage.mjs`: use server-side private object download; do not expose storage keys.

## Execution Notes

- Prefer 404 for missing, failed, incomplete, or non-owned artifacts.
- Set conservative private caching and correct `Content-Type`.
