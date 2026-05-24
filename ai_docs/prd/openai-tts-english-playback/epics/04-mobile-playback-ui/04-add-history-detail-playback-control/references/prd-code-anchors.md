# PRD And Code Anchors

## PRD Alignment

- `07-ui-component-changes.md`: history detail should show the same playback row as the result screen for completed translations.
- `09-implementation-phases.md`: Phase 5 includes history detail playback after the result screen.
- `11-definition-of-done.md`: `app/history.tsx` must support playback from translation detail.

## Repo Anchors

- `app/history.tsx`: detail panel currently renders English, Darija, file/completed metadata, and provider runs.
- `lib/api.ts`: `getTranslation(...)` detail response must include `tts`.
- `app/translate.tsx` or a shared helper/component: reuse playback UI/state rather than duplicating large blocks.

## Execution Notes

- Keep history list rows unchanged unless detail metadata is already available cheaply.
- Reset/cleanup playback state when changing selected history items.
