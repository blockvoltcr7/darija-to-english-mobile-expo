# PRD And Code Anchors

## PRD Alignment

- `06-technical-specifications.md`: defines `tts` response shape for null, succeeded, and failed states.
- `04-gap-analysis.md`: identifies missing relation query and DTO mapping for artifact metadata.
- `07-ui-component-changes.md`: mobile UI depends on stable `tts` metadata and `audioUrl`.

## Repo Anchors

- `server/translations.mjs`: `TRANSLATION_DETAIL_COLUMNS` currently joins results and provider runs only.
- `server/index.mjs`: `toTranslationDetail(...)` maps repository rows into public API detail payloads.
- `lib/api.ts`: `toTranslationResult(...)` will later preserve the server `tts` field.

## Execution Notes

- Public `tts` metadata should include safe lifecycle fields and relative `audioUrl`, not private bucket/object key.
- Keep `tts: null` explicit when disabled or not started.
