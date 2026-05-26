# Delete Account UI QA Checklist

Use this during execution after the UI and API contract are implemented. Capture only sanitized notes or screenshots in `artifacts/`.

## Discoverability

- [ ] Sign in with a disposable Clerk test user.
- [ ] Open Account from the app navigation.
- [ ] Confirm Delete Account or Privacy/Data is reachable from Account in no more than two taps.
- [ ] Confirm accessibility labels and hints identify the destructive action clearly.

## Confirmation And States

- [ ] Open the delete-account surface and verify consequence copy is visible before any destructive action can run.
- [ ] Cancel from the first prompt/surface and confirm no API request is sent.
- [ ] Trigger confirmation with an incorrect value if the UI requires typed confirmation; verify the destructive button remains disabled or shows a safe validation message.
- [ ] Trigger deletion with valid confirmation and verify loading disables duplicate submits.
- [ ] Verify completed, scheduled, reauthentication-required, partial-failure, and generic failure responses each show clear next-step copy.

## Privacy And Redaction

- [ ] Confirm the UI does not show Clerk session tokens, private object keys, full transcripts, audio contents, generated audio bytes, or provider secrets.
- [ ] Confirm user-facing copy distinguishes app-owned deletion from third-party processor retention limitations.
- [ ] Confirm any diagnostics are safe IDs/statuses only and remain consistent with production debug-gating work.

## Post-Action Navigation

- [ ] For completed or scheduled deletion, confirm the app signs out or routes to `/login` according to the final API response contract.
- [ ] Confirm local screen state no longer displays the deleted user's history/detail/playback content after completion.
