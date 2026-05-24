# Task 04: Add History Detail Playback Control

## Type

UI

## Context

`app/history.tsx` shows completed translation details and provider metadata. Historical translations with generated English audio should expose the same explicit playback behavior as the main translation result screen.

## Implementation

- Add the shared playback row/control to the history detail view when detail `tts.status === "succeeded"`.
- Use the same authenticated playback helper as `app/translate.tsx`.
- Keep history list rows unchanged unless TTS metadata is already available cheaply.
- Preserve existing history detail fields: English translation, consolidated Darija, raw transcripts, model metadata, and diagnostics.
- Show the same AI-generated voice disclosure near playback.

## Acceptance Criteria

- [ ] History detail can play generated English audio for a completed translation.
- [ ] History detail uses authenticated playback, not public object URLs.
- [ ] Missing or failed TTS does not hide historical text results.
- [ ] Playback state is isolated enough that navigating between items does not leave stale UI state.
- [ ] Existing history list behavior remains stable.

## Dependencies

- Depends On: add-translate-result-playback-control
- Blocks: 05-qa-docs-and-release-verification/update-tts-qa-and-agent-docs

## Technical Notes

- Avoid duplicating large UI blocks. A small shared component or hook is acceptable if it reduces real duplication between result and history surfaces.
- Do not add autoplay from history detail navigation.

## Artifact Slots

- `artifacts/`: simulator screenshots or notes for history detail playback.
- `references/`: current `app/history.tsx` detail rendering and shared playback helper.
- `resources/`: mocked historical detail payloads with succeeded and null TTS.
- `notes/`: reuse decisions and navigation cleanup notes.

