# 06 — Implementation Phases

## Phase 1 — Establish EAS Project And Build Profiles

Goal: create the Expo deployment control plane without changing app behavior.

Tasks:

- Run or document `npx eas-cli@latest init` for the project.
- Create `eas.json`.
- Add `development`, `preview`, `staging`, and `production` profiles.
- Confirm `app.json` identifiers remain:
  - iOS: `com.samisabiridrissi.darijatoenglish`
  - Android: `com.samisabiridrissi.darijatoenglish`
- Document Apple team and Android package assumptions.

Deliverable:

- `eas.json` exists and validates with EAS CLI.

Dependencies:

- Expo account access.
- Apple Developer access for iOS builds.

Parallelization:

- Can run in parallel with Phase 2 API hosting selection.

## Phase 2 — Select And Deploy Staging API Host

Goal: make the current Express API reachable by physical-device preview/staging builds.

Tasks:

- Select a Node API host.
- Add deployment config required by the chosen host.
- Configure staging environment variables.
- Deploy `server/index.mjs`.
- Verify `GET /health` over HTTPS.
- Document logs, rollback, and redeploy commands.

Deliverable:

- `https://<staging-api>/health` returns expected shape.

Dependencies:

- Host account access.
- Clerk, Supabase, OpenAI, Modal, and Trigger secrets.

Parallelization:

- Can run in parallel with Phase 1.
- Should complete before Phase 4 phone QA.

## Phase 3 — Configure EAS Environments

Goal: ensure each build lane uses the correct public API URL.

Tasks:

- Set `EXPO_PUBLIC_API_BASE_URL` for preview/staging/production.
- Set Clerk publishable keys for the right environment.
- Use the default EAS `development` environment for cloud-built development clients.
- Use the default EAS `preview` environment for both preview builds and the staging build profile until the Expo account supports custom `staging` environments.
- Verify no secrets are configured as Expo public variables.
- Update `.env.example` with non-secret examples.
- Optionally add a config assertion/test that non-local EAS builds cannot silently use localhost.

Deliverable:

- Preview build diagnostics show the staging API URL.

Dependencies:

- Phase 2 staging API URL.
- Current Expo account plan supports only default EAS environments: `development`, `preview`, and `production`.

Parallelization:

- Can begin with placeholder API URL, but final verification requires Phase 2.

## Phase 4 — Run Trigger.dev Development Worker

Goal: ensure queued jobs are consumed by the included Trigger.dev Development environment without paying for additional staging/preview environments.

Tasks:

- Configure Trigger.dev Development environment secrets.
- Run `npm run trigger:dev -- --env-file .env.local --skip-update-check`.
- Trigger one development-runtime job through API.
- Verify Trigger run reaches success.
- Document Trigger dashboard evidence and failure modes.

Deliverable:

- Development-environment Trigger run succeeds for a real uploaded audio fixture.

Dependencies:

- Phase 2 staging API.
- Supabase Storage and translation job rows working.

Parallelization:

- Can run after API deploy; does not require production EAS build.

## Phase 5 — Build And Install Preview App

Goal: test the app on a physical phone before store rollout.

Tasks:

- Register iPhone UDID if using iOS internal distribution.
- Run `npx eas-cli@latest build -p ios --profile preview`.
- Run Android preview build if Android scope is active.
- Install preview build via EAS URL/QR.
- Confirm diagnostics show staging API URL.
- Confirm sign-in/sign-up works.

Deliverable:

- Preview build installed on physical iPhone and reaches authenticated app screen.

Dependencies:

- Phase 1 EAS profiles.
- Phase 3 EAS env values.

Parallelization:

- Android preview build can happen independently of iOS once env is set.

## Phase 6 — Staging E2E QA

Goal: prove the full production-like workflow works on a phone.

Tasks:

- Sign out.
- Create a fresh Clerk test user.
- Verify account email changed.
- Verify History does not show previous user rows.
- Upload audio from the phone.
- Wait until job reaches `succeeded`.
- Verify visible sections:
  - English translation
  - Consolidated Darija
  - OpenAI transcript
  - Darija model transcript
  - Model metadata
- Capture sanitized API and Trigger evidence.

Deliverable:

- QA note with build ID, API URL, job ID, Trigger run ID, and final status.

Dependencies:

- Phases 2, 3, 4, and 5.

Parallelization:

- None. This is an end-to-end gate.

## Phase 7 — Store Beta And Production Readiness

Goal: prepare for TestFlight, Google Play test tracks, and public release.

Tasks:

- Configure EAS Submit.
- Create TestFlight build.
- Create Android internal/closed testing build.
- Verify staging or production API target based on release lane.
- Add production release checklist.
- Confirm rollback strategy for API and mobile update.

Deliverable:

- Release candidate distributed through TestFlight or Google Play testing.

Dependencies:

- Successful Phase 6 staging E2E QA.

## Dependency Graph

```text
Phase 1 EAS profiles ─┬─> Phase 3 EAS env ──> Phase 5 preview build ─┐
                       │                                             │
Phase 2 API host ──────┴─> Phase 4 Trigger deploy ───────────────────┤
                                                                     │
                                                                     v
                                                        Phase 6 staging E2E QA
                                                                     |
                                                                     v
                                                        Phase 7 store beta / prod
```
