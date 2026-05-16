# Staging E2E QA Evidence

## Summary

- Timestamp: `2026-05-16T21:27:37Z`
- Result: passed
- Platform: physical iPhone
- EAS build ID: `32823c20-98fe-46ea-bed9-991f4b38ff27`
- Build profile: `preview`
- EAS environment: `preview`
- Channel: `preview`
- API target: non-local HTTPS Cloud Run API configured through EAS public env
- Trigger runtime: Trigger.dev Development worker, local `trigger dev`

## Verified Paths

- Fresh Clerk auth: passed by user-confirmed iPhone sign-in/sign-up flow
- History isolation/loading: passed; History screen loaded current-user completed translation
- Upload audio: passed; app submitted audio and received a completed translation
- Record audio: passed; microphone path submitted audio and received a completed translation
- Trigger.dev: passed after local Development worker was connected
- Modal Darija ASR: passed; provider run displayed `modal_darija_asr` as `SUCCEEDED`
- OpenAI transcription: passed; provider run displayed `openai_transcription` as `SUCCEEDED`
- Final app rendering: passed; English and Darija result sections displayed in the app

## Key Observations

- Initial jobs stayed queued while the Trigger.dev Development worker was disconnected.
- Required runtime command for this no-paid-environment scope:

```bash
npm run trigger:dev -- --env-file .env.local --skip-update-check
```

- Once the worker was connected, Trigger executed the job and Modal received work as expected.

## Evidence References

- Auth and install evidence: Epic 04 preview-device-build artifacts.
- Runtime timeout evidence: user-provided iPhone screenshot showing queued status and Trigger run ID.
- Trigger evidence: user-provided Trigger.dev screenshot showing queued run while the local dev server was disconnected.
- History/result evidence: user-provided iPhone screenshot `Screenshot 2026-05-16 at 5.27.10 PM.png`.

## Residual Risks

- Trigger.dev Development worker must stay running for local/development QA. If it is stopped, mobile jobs can queue without Modal receiving work.
- Store beta and production release still need Epic 06 decisions around TestFlight/Play testing and production runtime deployment.
- Package-manager cleanup remains outside this evidence: `npx trigger.dev@latest dev` created uncommitted package changes that should be resolved before release prep.

## Redaction Check

- [x] No tokens
- [x] No passwords or verification codes
- [x] No secret values
- [x] No Clerk key values
- [x] No private audio files
- [x] No full run logs
