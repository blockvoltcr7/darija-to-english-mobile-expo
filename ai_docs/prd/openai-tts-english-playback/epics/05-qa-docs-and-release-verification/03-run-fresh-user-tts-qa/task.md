# Task 03: Run Fresh User TTS QA

## Type

Code

## Context

The repo’s acceptance path requires fresh Clerk user QA before release-readiness work. TTS adds a new visible result and playback path to verify in an iOS development build.

## Implementation

- Start the API and Trigger worker:

```bash
ENABLE_TTS=true npm run api
ENABLE_TTS=true npx trigger.dev dev --env-file .env.local
```

- Ensure TTS is enabled in the server runtime for this QA pass.
- Load a non-sensitive audio fixture into the iOS Simulator Files app using the project skill script.
- Run the app in an iOS development build with simulator API URL `http://localhost:8787`.
- Sign out, create a fresh Clerk test user, upload the fixture, and wait for `Complete`.
- Verify English translation, consolidated Darija, raw OpenAI transcript, raw Darija transcript, model metadata, diagnostics, and English audio playback.
- Capture safe evidence: branch/commit, simulator/build type, redacted user identifier, fixture filename/size, API job ID, Trigger run ID, final status, and visible result sections.

## Acceptance Criteria

- [ ] Fresh Clerk user can complete a translation with TTS enabled.
- [ ] UI shows and plays generated English audio when `tts.status === "succeeded"`.
- [ ] Existing text result sections remain visible.
- [ ] API and Trigger logs show safe milestones for TTS generation and storage.
- [ ] QA evidence avoids tokens, secrets, private audio contents, full transcripts, and audio bytes.

## Dependencies

- Depends On: run-static-and-api-verification
- Blocks: verify-failure-and-cross-user-access-paths

## Technical Notes

- Use an iOS development build, not Expo Go, for this acceptance path.
- If TTS fails due to provider/config issues, record whether the text result still completed.

## Artifact Slots

- `artifacts/`: fresh-user QA summary, screenshots if safe, and sanitized run evidence.
- `references/`: `ai_docs/fresh-clerk-user-qa.md` and root AGENTS fresh-user path.
- `resources/`: fixture metadata and simulator file-loading command.
- `notes/`: QA blockers, build details, and provider/config observations.
