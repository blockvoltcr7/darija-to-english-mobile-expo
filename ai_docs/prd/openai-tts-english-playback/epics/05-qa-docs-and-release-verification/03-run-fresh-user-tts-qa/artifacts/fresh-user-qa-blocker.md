2026-05-21

Status: blocked for live manual QA.

Completed prerequisites:

- Static checks passed.
- API `/health` passed.
- QA docs now include TTS-enabled evidence requirements.

Blocked requirement:

- Fresh Clerk user TTS QA needs an iOS development build, the API and Trigger worker running with `ENABLE_TTS=true`, a non-sensitive simulator audio fixture, interactive Clerk sign-up/email verification, and the ability to tap playback in the simulator.

Required safe evidence when unblocked:

- Branch and commit.
- Simulator/device and app build type.
- Redacted fresh Clerk user identifier.
- Fixture filename and size only.
- API job ID and Trigger run ID.
- Final text status and TTS artifact status.
- Confirmation that English translation, consolidated Darija, raw OpenAI transcript, raw Darija transcript, model metadata, diagnostics, and English audio playback are visible.

Do not record Clerk tokens, API keys, `.env` values, private audio contents, full transcripts, or generated audio bytes.
