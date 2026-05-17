# Task 05: Verify Release Readiness Gates

## Type

Code

## Context

This final Epic 06 gate decides what kind of release is justified by evidence. The app can be store-beta ready while still being public-release no-go. The gate must separate verified facts from blockers: real-device E2E passed in Epic 05, but production API, Trigger production deploy, usage controls, store metadata, privacy/legal, and account-deletion readiness may still be incomplete.

## Implementation

- Review Epic 04/05 evidence, current `eas.json`, `app.json`, deployment runbooks, store-beta build artifacts, production API plan, and release checklist.
- Run or record blockers for `node --check server/index.mjs`, `node --check trigger/translate-audio-job.mjs`, `npm run typecheck`, `npm run lint`, `npx expo-doctor`, and `curl <api>/health`.
- Confirm the latest QA evidence includes fresh Clerk auth, upload, microphone recording, translation success, history visibility, Trigger run ID, and API URL.
- Confirm store beta status per platform: not attempted, blocked, uploaded/processing, available to testers, or tested by user.
- Produce a concise go/no-go report with separate verdicts for internal development QA, store beta, wider external beta, and public release.

## Acceptance Criteria

- [ ] Release-readiness report exists in task artifacts or deployment docs.
- [ ] Verdicts are explicit for internal QA, TestFlight/Play store beta, wider beta, and public release.
- [ ] Report includes command results or precise blockers for syntax, typecheck, lint, expo-doctor, API health, Trigger, and store build status.
- [ ] Report references staging E2E evidence without exposing private transcripts, audio, tokens, or secrets.
- [ ] Blockers are assigned to domains: mobile, API, Trigger, Supabase/storage, Clerk/auth, Modal/OpenAI provider, EAS/store, usage controls, or legal/privacy.

## Dependencies

- Depends On: add-release-rollback-checklist

## Technical Notes

- Verification commands are listed in root `AGENTS.md`; use those as the default technical gate.
- `npx expo-doctor` may surface dependency/version drift; classify the result instead of ignoring it.
- If the Trigger worker is still local Development only, call that out as a beta/production runtime blocker instead of marking backend readiness as complete.
- Do not include full transcript text, private audio details, Clerk session tokens, or secret values in the final readiness artifact.

## Artifact Slots

- `artifacts/`: final readiness report, command-output summary, and go/no-go matrix.
- `references/`: prior epic evidence links, deployment source maps, and release checklist references.
- `resources/`: verification command list and evidence capture checklist.
- `notes/`: decision rationale, human actions, and residual risks.
