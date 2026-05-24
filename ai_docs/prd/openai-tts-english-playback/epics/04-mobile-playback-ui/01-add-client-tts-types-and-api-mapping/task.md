# Task 01: Add Client TTS Types And API Mapping

## Type

Code

## Context

The API will expose `tts` metadata on translation detail responses. The mobile app needs shared TypeScript contracts and API mapping before either result screen can render playback safely.

Current relevant files are `lib/types.ts` and `lib/api.ts`.

## Implementation

- Add `TranslationTtsArtifact` or equivalent to `lib/types.ts`.
- Attach optional `tts?: TranslationTtsArtifact | null` to translation result/detail types that power `app/translate.tsx` and `app/history.tsx`.
- Update `lib/api.ts` response mapping to preserve `tts: null`, succeeded metadata, and failed metadata.
- Resolve relative `audioUrl` values against `CONFIG.API_BASE_URL` if the client needs an absolute playback URL.
- Preserve existing result aliases and model metadata mapping.

## Acceptance Criteria

- [ ] Client types represent null, succeeded, running/queued, and failed TTS states.
- [ ] `lib/api.ts` maps `detail.tts || null` without dropping existing result fields.
- [ ] Relative playback URLs are resolved consistently when needed.
- [ ] Typecheck catches missing or malformed TTS fields in UI work.
- [ ] Existing upload/polling/history flows continue to compile.

## Dependencies

- Depends On: 03-api-response-and-playback/add-tts-detail-response-shape
- Blocks: add-authenticated-audio-playback-helper

## Technical Notes

- Keep API types tolerant enough for `tts: null`; absence of audio should not be an exceptional UI state.
- Do not add OpenAI or Supabase implementation details to mobile types.

## Artifact Slots

- `artifacts/`: typecheck output and sample mapped detail object.
- `references/`: PRD type changes and existing `lib/types.ts` result contracts.
- `resources/`: sample detail JSON fixtures for null/succeeded/failed TTS.
- `notes/`: URL resolution and compatibility decisions.

