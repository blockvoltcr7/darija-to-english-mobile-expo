# Epic 03: Production Runtime And Abuse Controls

## Goal

Remove the staging/local-worker dependency for public review and protect paid provider usage before launch.

## Scope

- Decide production isolation for Cloud Run, Trigger.dev, Clerk, Supabase, OpenAI, and Modal.
- Deploy production API and Trigger worker.
- Configure production auth, storage, and provider ownership/quotas.
- Add usage reservations, per-user/per-IP limits, max audio guardrails, and global kill switch.
- Run a production smoke test without local `trigger dev`.

## Tasks

1. `01-decide-production-resource-isolation`
2. `02-deploy-production-cloud-run-api`
3. `03-deploy-production-trigger-worker`
4. `04-configure-production-auth-storage-and-providers`
5. `05-add-usage-reservations-limits-and-kill-switch`
6. `06-add-audio-guardrails-and-quota-ux`
7. `07-run-production-smoke-test`

## Dependencies

- Depends On: `00-submission-baseline-and-app-store-inventory/write-submission-baseline-evidence`

## Exit Criteria

- Production API health checks pass.
- A fresh-user production translation succeeds using production Trigger.
- Quota and kill-switch paths are verified without repeatedly calling paid providers.

<!-- ENRICHED-OVERVIEW-START -->
## Enriched Overview

### Scope

Epic 03 turns the current staging/local-worker runtime into an App Store-ready production path and adds minimum abuse controls before public users can trigger paid provider calls. The work is intentionally bounded to production resource decisions, Cloud Run API deployment, Trigger production runtime, production auth/storage/provider configuration, server-side usage controls, audio/quota UX, and one sanitized production smoke test. It does not own legal copy, account deletion, production UI cleanup, App Store metadata, or execution status updates.

### Task Summary

| # | Slug | Type | Summary | Key Dependencies |
|---|---|---|---|---|
| 01 | `decide-production-resource-isolation` | Infrastructure | Record production-versus-shared decisions for Cloud Run, Trigger.dev, Clerk, Supabase, OpenAI, Modal, and EAS public env; identify blockers and privacy/quota impacts without secrets. | Epic 00 baseline evidence |
| 02 | `deploy-production-cloud-run-api` | Infrastructure | Deploy and document a production HTTPS API, verify `/health` and `/health/supabase`, and keep EAS production public env deferred until the URL is proven. | Task 01 |
| 03 | `deploy-production-trigger-worker` | Infrastructure | Deploy `translate-audio-job` to production Trigger and prove jobs are not dependent on local `trigger dev`. | Task 02, Task 01 |
| 04 | `configure-production-auth-storage-and-providers` | Infrastructure | Verify production Clerk, Supabase, Trigger, OpenAI, Modal, TTS, upload, and retention configuration by name/status while keeping secrets server-side. | Tasks 01-03 |
| 05 | `add-usage-reservations-limits-and-kill-switch` | Code | Add a content-free usage ledger/reservation model, global kill switch, per-user limits, per-IP burst controls, and safe quota responses before paid work starts. | Task 04 |
| 06 | `add-audio-guardrails-and-quota-ux` | UI | Enforce or expose max audio/type/size constraints and present quota, maintenance, unsupported-audio, and retry guidance in the translation UI. | Task 05 |
| 07 | `run-production-smoke-test` | Code | Run one fresh-user production translation from the production iOS/runtime path and capture sanitized health, job, Trigger, result, and TTS evidence. | Tasks 02-06 |

### Execution Notes

- Production API and Trigger deployment must stay aligned: `server/index.mjs` dispatches `trigger/translate-audio-job.mjs`, writes `translation_jobs.trigger_run_id`, and the worker must share the approved Trigger project/environment.
- Server-side trust boundaries are non-negotiable: OpenAI, Modal, Trigger, Supabase service-role/secret, and Clerk secret/webhook values stay out of mobile public env and committed evidence.
- Usage controls should be inserted before storage upload, Trigger dispatch, or provider work in the create-translation path, then reconciled around provider completion/failure in `server/translation-pipeline.mjs`.
- Guardrail and quota negative-path tests should avoid repeated valid paid-provider submissions; prefer failures that happen before storage/Trigger/provider calls.
- Production smoke-test evidence may include API URL, build metadata, `traceId`, `jobId`, `triggerRunId`, statuses, timings, model names, and result-field presence, but not tokens, secrets, private audio, full transcripts, provider request bodies, or generated audio bytes.
- Remaining assumptions: the release owner must choose whether production resources are fully isolated or shared with accepted risk; production Trigger availability may depend on account plan/access; EAS production public env must wait for a verified production API URL.
<!-- ENRICHED-OVERVIEW-END -->
