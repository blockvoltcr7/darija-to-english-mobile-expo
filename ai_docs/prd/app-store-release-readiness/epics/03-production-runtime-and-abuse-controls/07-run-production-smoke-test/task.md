# Run Production Smoke Test

## Type

Code

## Context

The PRD definition of done requires one successful production smoke test from an iOS build using the production API/runtime. This is the release gate proving App Review can complete the core workflow without a local Trigger worker, while keeping evidence sanitized and avoiding private audio/transcript disclosure.

## Implementation

- Use `resources/production-smoke-test-checklist.md` to run health checks, confirm the iOS build target, create/sign in with a test Clerk user, submit a short non-sensitive fixture, poll to terminal state, and verify history/playback if TTS is enabled.
- Verify production `/health` and `/health/supabase` before submitting audio; stop if either reveals production configuration blockers.
- Capture evidence in `artifacts/production-smoke-test-report.md`: API URL class, build profile/channel/version, commit SHA, timestamp, `traceId`, `jobId`, `triggerRunId`, statuses, timing, result-field presence, and TTS artifact status if applicable.
- Correlate mobile diagnostics, Cloud Run logs, Trigger run logs, and Supabase row status using safe IDs only.

## Acceptance Criteria

- [ ] One fresh-user production translation reaches `succeeded` without local `trigger dev`.
- [ ] Health checks pass before the authenticated job test.
- [ ] Evidence includes production API URL, build/runtime metadata, sanitized IDs/statuses/timing, and result-field presence.
- [ ] TTS status is recorded when enabled, and text success remains visible if TTS fails.
- [ ] Evidence omits Clerk tokens, API keys, `.env` values, private audio, full transcripts, provider request/response bodies, and generated audio bytes.

## Dependencies

- Depends On: `deploy-production-cloud-run-api`
- Depends On: `deploy-production-trigger-worker`
- Depends On: `configure-production-auth-storage-and-providers`
- Depends On: `add-usage-reservations-limits-and-kill-switch`
- Depends On: `add-audio-guardrails-and-quota-ux`
- Blocks: `05-app-store-submission-package-and-testflight-evidence/create-reviewer-instructions-and-demo-account`

## Technical Notes

- `ai_docs/deployment/release-checklist.md` and `ai_docs/deployment/triggerdev.md` define the sanitized evidence fields and correlation IDs.
- `lib/api.ts` refreshes Clerk polling tokens for long-running jobs; production smoke evidence should mention whether polling stayed within the expected timeout.
- If the production build still points at staging or local API, stop and record the mismatch instead of treating it as production proof.
- This task should not update execution status files; artifacts are enough for execution-time proof.

## Artifact Slots

- `artifacts/production-smoke-test-report.md`: final sanitized smoke-test evidence.
- `references/source-anchors.md`: release checklist, Trigger runbook, API/client route anchors.
- `resources/production-smoke-test-checklist.md`: step-by-step smoke-test checklist.
- `notes/smoke-test-blockers.md`: production blockers, timing issues, or environment mismatches.
