# Implementation Phases

## Phase 0 — Submission Baseline And Native Inventory

Goal: Freeze the current iOS submission assumptions before implementation work starts.

Tasks:

- Inventory `app.json`, `eas.json`, package versions, EAS channels, runtime version, and App Store Connect app ID.
- Decide production EAS submit credential strategy.
- Inventory production Clerk sign-in methods and decide whether Sign in with Apple work is required.
- Confirm `ITSAppUsesNonExemptEncryption=false` is accurate.
- Confirm iPad support is intentional because `ios.supportsTablet=true`.
- Define EAS Update production policy.

Files:

- `app.json`
- `eas.json`
- `package.json`
- `ai_docs/deployment/release-checklist.md`
- `ai_docs/prd/app-store-release-readiness/08-ios-submission-evaluator-report.md`

Deliverable:

- App Store submission baseline document with no secrets, Apple credentials, or `.env` values.

## Phase 1 — Legal, Disclosure, And Consent Foundation

Goal: Make data handling explicit before any production submission.

Tasks:

- Create or link public Privacy Policy, Terms, and Data Deletion pages.
- Add in-app Legal screen/routes.
- Add AI processing disclosure copy and consent gate.
- Add consent persistence server-side.
- Update signup copy to remove QA wording.
- Add AI output limitation copy.
- Update App Store privacy data inventory.

Files:

- `app/signup.tsx`
- `app/account.tsx`
- `app/legal.tsx` or equivalent
- `lib/config.ts`
- `server/index.mjs`
- `server/translations.mjs` or new consent module
- `supabase/migrations/*user_consents*.sql`
- `docs/legal/*` or hosted legal content source

Deliverable:

- Fresh user cannot submit audio until required consent is accepted.

## Phase 2 — Account Deletion

Goal: Satisfy in-app account deletion expectations with real data cleanup.

Tasks:

- Add Account -> Privacy/Data -> Delete Account UI.
- Add authenticated account deletion API.
- Add user-scoped deletion helpers for profiles, translation jobs/results, provider runs, artifacts, and storage objects.
- Integrate Clerk deletion or deletion scheduling.
- Add safe audit event.
- Add tests or QA scripts for deletion.

Files:

- `app/account.tsx`
- `server/index.mjs`
- `server/profiles.mjs`
- `server/translations.mjs`
- `server/storage.mjs`
- `supabase/migrations/*account_deletion*.sql`
- `ai_docs/deployment/app-store-submission.md`

Deliverable:

- Test user can delete account from app; subsequent login fails or account state is removed; private storage is cleaned or marked according to policy.

## Phase 3 — Production Runtime

Goal: Remove dependency on staging/shared/local development runtime for public release.

Tasks:

- Deploy `darija-api-production` Cloud Run service.
- Configure production API env/secrets.
- Configure production Clerk publishable/secret/webhook.
- Configure production Supabase project or accepted production isolation plan.
- Deploy Trigger.dev production worker.
- Configure production OpenAI and Modal provider ownership/quotas.
- Verify `/health`, `/health/supabase`, authenticated submit, polling, history, and TTS playback.

Files:

- `ai_docs/deployment/production-api.md`
- `ai_docs/deployment/triggerdev.md`
- `eas.json`
- Cloud Run/Trigger environment configuration outside repo

Deliverable:

- One successful production smoke test with sanitized `traceId`, `jobId`, `triggerRunId`, status, and build metadata.

## Phase 4 — Production UI Cleanup

Goal: Ship a polished public UI without beta/debug internals.

Tasks:

- Add release-mode config flags.
- Hide diagnostics/API URL/model internals by default.
- Hide raw provider transcripts in production unless support mode is enabled.
- Replace QA wording.
- Verify app on small/large iPhones and iPad layout because `supportsTablet=true`.

Files:

- `lib/config.ts`
- `app/translate.tsx`
- `app/history.tsx`
- `app/signup.tsx`
- `app/account.tsx`

Deliverable:

- Production build shows user-facing workflow only; diagnostics available only when explicitly enabled.

## Phase 5 — Usage Controls And Abuse Protection

Goal: Prevent uncontrolled paid provider usage after public launch.

Tasks:

- Add usage ledger/reservation before provider calls.
- Add per-user and per-IP limits.
- Add global kill switch.
- Add error UX for quota/maintenance.
- Add operational runbook.

Files:

- `server/index.mjs`
- `server/translation-pipeline.mjs`
- `server/translations.mjs`
- `supabase/migrations/*usage*.sql`
- `app/translate.tsx`
- `ai_docs/deployment/release-checklist.md`

Deliverable:

- Quota and kill-switch paths are verified without calling paid providers repeatedly.

## Phase 6 — App Store Submission Package

Goal: Prepare the human-owned App Store submission package.

Tasks:

- Create App Store metadata draft.
- Fill privacy questionnaire.
- Verify privacy labels against `12-app-store-privacy-data-inventory.md`.
- Confirm privacy policy/support URLs.
- Create screenshots from production UI.
- Create reviewer demo account.
- Add reviewer notes.
- Review TestFlight/App Store Connect upload warnings, including privacy manifest warnings.
- Run final production smoke test.
- Build and submit production iOS binary.

Files:

- `store.config.json` if using EAS Metadata
- `ai_docs/deployment/app-store-submission.md`
- `ai_docs/deployment/testflight-qa-log.md`
- `app.json`
- `eas.json`

Deliverable:

- App Store Connect submission is ready for human release owner review.

## Dependency Graph

```text
Phase 0 Submission Baseline
  |
  v
Phase 1 Legal/Consent
  |
  +--> Phase 2 Account Deletion
  |
  +--> Phase 4 Production UI Cleanup

Phase 3 Production Runtime
  |
  +--> Phase 5 Usage Controls
  |
  +--> Phase 6 App Store Submission

Phase 0 + Phase 1 + Phase 2 + Phase 3 + Phase 4 + Phase 5
  |
  v
Phase 6
```

## Parallelization Notes

- Legal content drafting can run in parallel with account deletion implementation.
- Production runtime setup can run in parallel with UI cleanup after env contracts are agreed.
- App Store metadata can start early, but privacy labels must wait until data inventory and legal wording are final.
- Usage controls should be implemented before public submission, but detailed billing can remain out of scope.
- Phase 0 should run before seeding or executing deeper epics because auth, tablet, EAS submit, and OTA decisions affect multiple later phases.
