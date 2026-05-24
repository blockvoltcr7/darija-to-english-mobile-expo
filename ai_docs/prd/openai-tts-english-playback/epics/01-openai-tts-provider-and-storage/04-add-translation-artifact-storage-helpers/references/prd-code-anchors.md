# PRD And Code Anchors

## PRD Alignment

- `05-architecture-plan.md`: adds generated artifact upload/download helpers to `server/storage.mjs`.
- `06-technical-specifications.md`: defines `aac` and `mp3` MIME behavior and private `translation-artifacts` storage.
- `10-risk-assessment.md`: private audio exposure is a high risk; storage object keys must stay server-side.

## Repo Anchors

- `server/storage.mjs`: reuse `safePathSegment`, original-audio object key shape, upload helper style, and `downloadStoredObject`.
- `server/env.mjs`: already exposes `SUPABASE_TRANSLATION_ARTIFACTS_BUCKET`.
- `server/index.mjs`: playback route will later call server-side download logic.

## Execution Notes

- Keep bucket private and return storage metadata only to repository code.
- Do not include English text, provider secrets, tokens, or raw audio bytes in object keys or logs.
