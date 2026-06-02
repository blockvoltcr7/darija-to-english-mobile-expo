# AGENTS.md

## Scope

Expo Router screens and mobile UI live here.

## Files

| Path | Purpose |
| --- | --- |
| `_layout.tsx` | Router stack and app-level navigation shell. |
| `index.tsx` | Public mobile landing screen for signed-out users. Signed-in users redirect to `translate.tsx`. |
| `login.tsx` | Custom Clerk email-code-only sign-in entry. |
| `signup.tsx` | Custom Clerk account creation with name, email, password, acknowledgement, and email code delivery. |
| `verify.tsx` | Custom Clerk email-code verification and missing-requirements recovery. |
| `sign-in.tsx` | Backward-compatible redirect to `login.tsx`. |
| `translate.tsx` | Main Darija audio recording/upload, diagnostics, transcript, translation, and metadata UI. |
| `account.tsx` | Clerk account/profile and sign-out screen. |
| `history.tsx` | Authenticated translation history and detail view. |

## UI Rules

- Keep `Record` and `Upload Audio` as the two primary input paths.
- Disable upload while recording or while a request is running.
- Show consolidated Arabic/Darija as the main transcript.
- Show English translation separately.
- Keep raw OpenAI and Darija transcript sections visible while debugging/testing.
- Keep diagnostics useful for device testing, especially trace IDs, base URLs, health checks, response keys, and transcript lengths.
- Do not log Clerk session tokens. Only log that a token was retrieved.
- Keep the signed-out landing screen utilitarian and action-oriented. The signed-in first screen is `translate.tsx`.

## Mobile Platform Notes

- iPhone/physical device cannot use `localhost` for the API; it must use the Mac LAN IP.
- Android emulator should use `http://10.0.2.2:8787`.
- Web may not support every native audio/file API; prefer testing recording/upload on iOS or Android.
- Document picker should keep `copyToCacheDirectory: true` so selected iOS files can be read immediately.
- Clerk native profile components require a development build, not plain Expo Go.

## Fresh Clerk User QA

- Start from `account.tsx`, sign out, then use `signup.tsx` to create a new Clerk test user.
- Verify the email code on `verify.tsx`; if Clerk reports missing requirements, finish the fields shown on that screen.
- After sign-up/sign-in, confirm the header/account UI shows the new user's email before uploading audio.
- Use `Upload Audio` to pick the simulator fixture from `Files > Browse > On My iPhone > Downloads`.
- Keep the UI on the active job until it reaches `Complete`; do not treat `queued` or `running` as success.
- Success requires visible English translation, consolidated Darija, raw OpenAI transcript, raw Darija transcript, and model metadata.
- Diagnostics should show health, Clerk token loaded, queued job ID, Trigger run ID, polling status, and final UI state without printing token values.
- When testing account isolation, open history as the fresh user and verify previous users' translation rows are not visible.

## Verification

```bash
npm run typecheck
npm run lint
npm run ios
npm run android
```
