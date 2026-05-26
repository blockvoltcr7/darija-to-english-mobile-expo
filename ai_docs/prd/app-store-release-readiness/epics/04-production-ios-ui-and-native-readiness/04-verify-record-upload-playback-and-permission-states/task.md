# Verify Record Upload Playback And Permission States

## Type

Code

## Context

The definition of done requires a production-like iOS build to pass the core App Review path: clean microphone permission prompt, recording, document import/upload, result display, and English audio playback. This task is verification-heavy, not a feature rewrite. It proves the release UI remains usable after diagnostics are hidden and permission/copy changes are applied.

## Implementation

Use `resources/record-upload-playback-permission-qa.md` as the execution checklist. Verify `app/translate.tsx` record flow (`AudioModule`, `useAudioRecorder`), upload flow (`expo-document-picker` with `copyToCacheDirectory: true`), polling via `lib/api.ts`, and playback through `components/EnglishAudioPlayback.tsx`. Use a non-sensitive audio fixture and the simulator file-loading skill when testing iOS simulator upload. Capture results in `artifacts/workflow-qa-report-template.md` or a filled copy of it; include build/device/env metadata and sanitized IDs only.

## Acceptance Criteria

- [ ] Clean-install microphone prompt appears with product-specific copy and the accepted path can start recording.
- [ ] Recording path submits audio, polls until text result, and renders English translation plus consolidated Darija in release-mode UI.
- [ ] Upload path imports a non-sensitive audio fixture through the document picker and reaches the same result display.
- [ ] English audio playback is visible and functional when TTS metadata is `succeeded`; TTS failure does not hide the English text result.
- [ ] Denied microphone permission state is understandable, recoverable through Settings/retry guidance, and does not expose diagnostics in production mode.
- [ ] Evidence omits private audio contents, full transcripts, generated audio bytes, Clerk tokens, API keys, and `.env` values.

## Dependencies

- Depends On: `replace-qa-and-permission-copy`
- Depends On: `03-production-runtime-and-abuse-controls/run-production-smoke-test`
- Blocks: `verify-iphone-ipad-layouts-or-tablet-decision`
- Blocks: `05-app-store-submission-package-and-testflight-evidence/capture-production-screenshots`
- Blocks: `05-app-store-submission-package-and-testflight-evidence/run-final-testflight-smoke-and-evidence`

## Technical Notes

- `app/translate.tsx` currently requests microphone permission on screen load and disables the primary record button when `permissionGranted !== true`.
- Upload uses `DocumentPicker.getDocumentAsync({ type: 'audio/*', copyToCacheDirectory: true, multiple: false, base64: true })`.
- `lib/api.ts` polls for up to 420 seconds and refreshes Clerk session tokens when a refresh callback exists.
- For public App Review readiness, do not count a run that requires a local `trigger dev` worker; production-runtime proof belongs to Epic 03 and should be referenced here.

## Artifact Slots

- `artifacts/workflow-qa-report.md`: filled execution-time record/upload/playback/permission QA report.
- `artifacts/workflow-qa-report-template.md`: template provided by enrichment; duplicate or fill during execution.
- `references/workflow-qa-source-anchors.md`: local code and PRD anchors for the workflow.
- `resources/record-upload-playback-permission-qa.md`: repeatable QA checklist and command notes.
- `notes/workflow-qa-blockers.md`: native permission, document picker, TTS playback, or production-runtime blockers.
