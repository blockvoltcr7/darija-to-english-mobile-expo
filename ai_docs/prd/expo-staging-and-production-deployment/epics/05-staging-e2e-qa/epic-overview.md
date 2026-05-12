# Epic 05: Staging E2E QA

## Objective

Prove the production-like phone workflow works end to end with a fresh Clerk user, staged API, deployed Trigger worker, Supabase persistence/storage, Modal Darija ASR, OpenAI, and visible app results.

## Scope

- Fresh Clerk user sign-up and sign-in.
- History isolation.
- Phone audio upload.
- Polling through queued to succeeded.
- Result-section verification.
- Evidence capture for release readiness.

## Out Of Scope

- Usage quotas and billing.
- Store beta distribution.
- Legal policy authoring.

## Tasks

| # | Task | Type | Depends On |
| --- | --- | --- | --- |
| 01 | `run-fresh-clerk-user-auth-qa` | Code | `04-preview-device-build/verify-preview-app-diagnostics` |
| 02 | `verify-history-isolation` | Code | `run-fresh-clerk-user-auth-qa` |
| 03 | `upload-phone-audio-fixture` | Code | `verify-history-isolation`, `03-triggerdev-staging-runtime/verify-trigger-claims-real-job` |
| 04 | `verify-translation-result-sections` | Code | `upload-phone-audio-fixture` |
| 05 | `capture-staging-qa-evidence` | Code | `verify-translation-result-sections` |

## Verification

- Fresh Clerk user can sign up and sign in.
- Previous user history is not visible.
- Uploaded audio creates a queued job and then succeeds.
- App displays English translation, consolidated Darija, raw STT outputs, and model metadata.
- QA evidence includes build profile, API URL, job ID, Trigger run ID, and final status.

