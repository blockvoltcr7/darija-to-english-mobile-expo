# PRD And Code Anchors

## PRD Alignment

- `07-ui-component-changes.md`: defines mobile `tts` mapping, relative URL resolution, and visible playback states.
- `06-technical-specifications.md`: defines client type shape for TTS metadata.
- `11-definition-of-done.md`: `lib/types.ts` and `lib/api.ts` must include TTS metadata mapping.

## Repo Anchors

- `lib/types.ts`: add shared `TranslationTtsArtifact` and attach it to result/detail contracts.
- `lib/api.ts`: `toTranslationResult(...)`, `getTranslation(...)`, and polling result mapping need to preserve `tts`.
- `lib/config.ts`: source for `CONFIG.API_BASE_URL` when resolving relative audio URLs.

## Execution Notes

- Treat `tts: null` as normal, not an error.
- Keep OpenAI, Supabase, bucket, and object-key details out of mobile-facing types.
