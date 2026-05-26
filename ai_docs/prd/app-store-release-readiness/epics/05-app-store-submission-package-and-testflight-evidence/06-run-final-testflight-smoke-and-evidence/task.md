# Run Final TestFlight Smoke And Evidence

## Type

Code

## Context

Final App Review readiness requires a TestFlight run that uses the production binary and production runtime. This should prove the reviewer path without relying on local development services.

## Implementation

- Install or launch the production TestFlight build.
- Sign in with the reviewer demo path or an equivalent release-owner test account.
- Submit a short non-sensitive Moroccan Darija audio sample by upload or recording.
- Verify the job reaches `succeeded`, shows English translation, shows consolidated Darija, and plays English audio if TTS succeeds.
- Verify diagnostics are hidden in production UI.
- Capture sanitized trace/job/run IDs, status, timing, and build metadata.

## Acceptance Criteria

- Final TestFlight smoke test succeeds against production API and production Trigger.
- Evidence confirms no local `trigger dev` dependency.
- Production UI hides diagnostics and internal model/provider details by default.
- Evidence omits full transcripts, private audio, generated audio bytes, tokens, and secrets.

## Dependencies

- Depends On: build-and-submit-production-ios-to-testflight
- Depends On: `03-production-runtime-and-abuse-controls/run-production-smoke-test`

## Technical Notes

- If TTS fails but text result succeeds, record the TTS artifact state without treating text as failed unless PRD policy changed.
- Physical device actions may require release-owner participation.

## Artifact Slots

- `artifacts/`: final TestFlight smoke report
- `references/`: QA log and production smoke-test anchors
- `resources/`: on-device QA checklist
- `notes/`: device/human handoffs and blockers

