# Fresh Clerk User QA

Use this checklist when verifying that sign-out, new Clerk user creation, and async audio translation work without leaking state from a previous user.

## Setup

Start the API and Trigger worker in separate terminals:

```bash
ENABLE_TTS=true npm run api
```

```bash
ENABLE_TTS=true npx trigger.dev dev --env-file .env.local
```

Use `ENABLE_TTS=true` for both the API process and the Trigger worker when verifying generated English audio. The worker runs the stored translation pipeline and owns TTS generation. If you are verifying text-only fallback behavior, document that TTS was disabled.

Load a non-sensitive audio fixture into the booted iOS Simulator:

```bash
.agents/skills/ios-simulator-files/scripts/add_to_simulator_files.sh /absolute/path/to/audio.m4a
```

## Account Flow

1. Open the app as the existing signed-in user.
2. Tap `Account` from the main screen.
3. Tap `Sign out`, cancel once, and confirm the user remains signed in.
4. Tap `Sign out` again, confirm, and verify the app returns to the signed-out landing screen.
5. Tap `Create account`, enter name, email, password, and the audio-processing acknowledgement.
6. Verify the Clerk email code on the app's `Verify email` screen.
7. If Clerk reports missing requirements, complete the fields shown on the verification screen.
8. Return to Account and verify the displayed email belongs to the fresh user.

## Isolation Checks

1. Verify the main screen no longer shows the previous user's translation result or diagnostics.
2. Open History and verify previous user rows are not visible.
3. Upload the simulator audio fixture.
4. Wait for `Complete`.
5. Verify the result screen shows English translation, consolidated Darija, raw OpenAI transcript, raw Darija transcript, and model metadata.
6. When TTS is enabled and `tts.status === "succeeded"`, verify the English translation audio row appears, shows the AI-generated voice disclosure, and plays only after tapping Play.
7. Open History, select the completed translation, and verify the same English audio playback control appears in the detail view.
8. If TTS fails, verify the English translation remains visible and diagnostics/API detail show safe voice failure metadata.

## Log Evidence

Capture only sanitized evidence:

- API profile resolution for the fresh Clerk user ID.
- Queued translation job ID.
- Trigger run ID.
- Modal ASR HTTP 200.
- OpenAI STT, consolidation, and translation completion.
- TTS milestone when enabled: artifact row created/running, OpenAI TTS completion or safe failure, private artifact upload, and playback route check.
- Final translation status `succeeded`.
- TTS artifact status: `succeeded` or `failed`, recorded separately from text translation status.
- Playback route result for the owning user and any negative-path checks performed.

Do not copy Clerk tokens, `.env` values, API keys, private audio contents, full transcripts, or generated audio bytes into QA notes.
