# PRD And Code Anchors

## PRD Alignment

- `07-ui-component-changes.md`: result screen should show compact playback only for succeeded TTS and include AI-generated voice disclosure.
- `03-product-goals-success-metrics.md`: mobile playback success is a core product metric.
- `11-definition-of-done.md`: `app/translate.tsx` must show Play/Pause only when TTS succeeded.

## Repo Anchors

- `app/translate.tsx`: English translation panel is the insertion point; diagnostics and model metadata already exist below it.
- `lib/types.ts`: UI should branch on the typed `tts` field.
- `lib/api.ts`: polling result mapping must include audio metadata before this UI can render.

## Execution Notes

- Do not autoplay; require explicit tap.
- Failed TTS should be quiet in the primary UI and visible only as concise diagnostics when appropriate.
