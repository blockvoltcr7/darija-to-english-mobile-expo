# PRD And Code Anchors

## PRD Alignment

- `07-ui-component-changes.md`: playback may need authenticated fetch plus temporary local file if headers cannot be attached directly.
- `10-risk-assessment.md`: Expo authenticated URL support is a medium risk.
- `11-definition-of-done.md`: playback must use authenticated route behavior and never expose provider secrets.

## Repo Anchors

- `app/translate.tsx`: already uses `expo-audio`, `expo-file-system`, and Clerk `getToken` around translation upload.
- `app/history.tsx`: already uses Clerk `getToken` for authenticated history detail calls.
- `package.json`: confirms `expo-audio` and Expo file APIs are part of the current app surface.

## Execution Notes

- Use a fresh Clerk token for playback requests.
- Prefer a reusable hook/helper so result and history screens share token, loading, play/pause, error, and cleanup behavior.
