# AGENTS.md

## Scope

Expo Router screens and mobile UI live here.

## Files

| Path | Purpose |
| --- | --- |
| `_layout.tsx` | Router stack and app-level navigation shell. |
| `index.tsx` | Main Darija audio recording/upload, diagnostics, transcript, translation, and metadata UI. |
| `sign-in.tsx` | Clerk native sign-in/sign-up screen. |
| `account.tsx` | Clerk account/profile and sign-out screen. |

## UI Rules

- Keep `Record` and `Upload Audio` as the two primary input paths.
- Disable upload while recording or while a request is running.
- Show consolidated Arabic/Darija as the main transcript.
- Show English translation separately.
- Keep raw OpenAI and Darija transcript sections visible while debugging/testing.
- Keep diagnostics useful for device testing, especially trace IDs, base URLs, health checks, response keys, and transcript lengths.
- Do not log Clerk session tokens. Only log that a token was retrieved.
- Avoid adding marketing/landing-page UI inside the app; make the first screen the usable translation tool.

## Mobile Platform Notes

- iPhone/physical device cannot use `localhost` for the API; it must use the Mac LAN IP.
- Android emulator should use `http://10.0.2.2:8787`.
- Web may not support every native audio/file API; prefer testing recording/upload on iOS or Android.
- Document picker should keep `copyToCacheDirectory: true` so selected iOS files can be read immediately.
- Clerk native components require a development build, not plain Expo Go.

## Verification

```bash
npm run typecheck
npm run lint
npm run ios
npm run android
```
