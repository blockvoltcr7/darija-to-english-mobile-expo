# Go/No-Go Decision Matrix

Use this matrix when converting evidence into the final recommendation.

## Decision Lanes

| Lane | Minimum Go Conditions | No-Go Conditions |
| --- | --- | --- |
| Internal preview QA | Preview build installs, diagnostics show non-local HTTPS staging API, fresh Clerk user can complete upload or recording flow, and Trigger worker is connected. | Build cannot install, API target is local/wrong, auth cannot complete, or jobs stay queued without a connected worker. |
| Store beta with staging backend | Staging E2E passed recently enough for the release decision, store build/submit path is configured or blocked only by explicit human account actions, app diagnostics prove the intended API target, and rollback checklist exists. | No current build/submit evidence, missing release rollback checklist, unresolved app/API diagnostics mismatch, or staging E2E is missing. |
| Public production release | Dedicated production API URL and env are decided, production Trigger deployment is decided, usage controls/legal/account deletion/retention are verified, store review metadata is ready, and all verification commands pass. | Production API is deferred, Trigger is Development-only, usage controls lack completion evidence, legal/account deletion docs are missing, or large-audio/body-size risk remains unresolved. |

## Domain Classification

Assign each blocker to exactly one primary owner in the final report:

| Domain | Examples |
| --- | --- |
| Mobile | App crash, diagnostics mismatch, wrong API base URL, auth UI issue, upload/recording UI issue. |
| API | `/health` failure, Clerk verification failure, storage write failure, body-size limit, Cloud Run deployment issue. |
| Trigger | Worker disconnected, wrong project/environment, missing Trigger secret, production deploy deferred. |
| Provider | OpenAI STT/consolidation/translation failure, Modal Darija ASR failure, provider timeout. |
| EAS/store | Missing Apple/Google credentials, build failure, submit failure, TestFlight/Play app record missing. |
| Usage controls | Missing usage ledger, reservation, rate limit, kill switch, retention cleanup, account deletion, or legal docs. |

## Current Audit Bias

As of this support-material audit, the safest default recommendation is:

- Store beta: pending Epic 06 task 01-04 evidence and fresh command/API checks.
- Public release: no-go until production API/Trigger decisions and separate usage-control Epic 04 verification are complete.

Update this note only with new source-grounded evidence.
