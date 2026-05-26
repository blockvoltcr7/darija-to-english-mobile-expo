# Hide Production Diagnostics And Provider Internals

## Type

UI

## Context

The PRD production UI target says public builds should show the user workflow only: record/upload, English translation, consolidated Darija, and optional English playback. `app/translate.tsx` currently renders API target chips, API URL, diagnostics, raw OpenAI/Darija transcripts, and model metadata; `app/history.tsx` renders model names and provider operation rows. These are valuable for TestFlight support but are noisy and review-risky in the public App Store UI.

## Implementation

Use `CONFIG.ENABLE_DIAGNOSTICS` from Task 01. In `app/translate.tsx`, gate the API chip row, API warning, diagnostics panel, raw provider transcript panels, and model metadata row behind diagnostics/support visibility while preserving the main English, consolidated Darija, record, upload, resume, and playback paths. In `app/history.tsx`, hide list model strings and detail `providerRuns` unless diagnostics are enabled. Keep response parsing in `lib/api.ts` and `lib/types.ts` intact; this is presentation gating, not contract removal.

## Acceptance Criteria

- [ ] With `EXPO_PUBLIC_APP_ENV=production` and diagnostics unset/false, the translate screen hides API URL, API target, diagnostics, raw provider transcripts, model names, trace IDs, job IDs, and Trigger run IDs.
- [ ] Production history list/detail hides model strings and provider operation rows while preserving English, Darija, file/date, status, and TTS playback.
- [ ] With `EXPO_PUBLIC_ENABLE_DIAGNOSTICS=true`, existing QA/support diagnostics remain available without exposing secrets or tokens.
- [ ] Upload, record, polling, recoverable-job resume, result rendering, and English audio playback still work when diagnostic panels are hidden.
- [ ] Screenshot/evidence guidance records only sanitized UI state, not private transcripts or generated audio bytes.

## Dependencies

- Depends On: `add-release-mode-config-flags`
- Blocks: `replace-qa-and-permission-copy`
- Blocks: `verify-record-upload-playback-and-permission-states`
- Blocks: `verify-iphone-ipad-layouts-or-tablet-decision`
- Blocks: `05-app-store-submission-package-and-testflight-evidence/capture-production-screenshots`

## Technical Notes

- Translate anchors: `app/translate.tsx` builds diagnostics state, API target details, visible chip row, diagnostics panel, raw transcript panels, and metadata row.
- History anchors: `app/history.tsx` uses `modelLine(item)` in list rows and `detail.providerRuns` in detail view.
- Preserve `TranslationResult`, `TranslationHistoryListItem`, and `TranslationHistoryDetail` fields; support tooling and server responses still need them.
- A support mode can display safe IDs and provider status to the signed-in user, but must never print Clerk session tokens, `.env` values, API keys, private audio bytes, or full transcripts in docs.

## Artifact Slots

- `artifacts/diagnostics-visibility-state-matrix.md`: execution-time matrix or screenshots showing production hidden vs support visible states.
- `references/production-diagnostics-source-anchors.md`: UI, API contract, PRD, and privacy inventory anchors.
- `resources/diagnostics-visibility-checklist.md`: QA checklist for toggling production/support visibility.
- `notes/support-mode-boundary.md`: release-owner decisions about what support mode may expose.
