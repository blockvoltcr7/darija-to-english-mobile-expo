# Task 03: Add Translate Result Playback Control

## Type

UI

## Context

`app/translate.tsx` currently shows English translation, consolidated Darija, raw transcripts, model metadata, and diagnostics. The PRD adds a compact audio row under or inside the English translation area when generated English audio is available.

## Implementation

- Add a Play/Pause control under the English translation result area when `tts.status === "succeeded"`.
- Hide the control when `tts === null`.
- Optionally show muted QA-only text such as `Preparing audio...` for queued/running if it fits existing UI patterns.
- Keep failed TTS out of the primary success path; diagnostics may show `Voice unavailable`.
- Add visible AI-generated voice disclosure near playback.
- Add accessibility labels: `Play English translation audio` and `Pause English translation audio`.
- Preserve text result layout, selectable text, diagnostics, and existing model metadata.

## Acceptance Criteria

- [ ] Succeeded TTS shows a compact Play/Pause row under English translation.
- [ ] `tts === null` shows no playback row.
- [ ] Failed TTS does not block or visually dominate the text result.
- [ ] Playback starts only after explicit tap.
- [ ] AI-generated voice disclosure is visible outside diagnostics.
- [ ] Accessibility labels are present for play and pause states.

## Dependencies

- Depends On: add-authenticated-audio-playback-helper
- Blocks: add-history-detail-playback-control

## Technical Notes

- Use existing app styling and component patterns; do not introduce a landing-page or hero-style audio surface.
- Keep the audio row compact because the translation text remains the primary result.

## Artifact Slots

- `artifacts/`: simulator screenshots for no-TTS, succeeded-TTS, and failed-TTS states.
- `references/`: current `app/translate.tsx` result layout and PRD UI state table.
- `resources/`: mocked result payloads for UI state checks.
- `notes/`: accessibility and visual hierarchy decisions.

