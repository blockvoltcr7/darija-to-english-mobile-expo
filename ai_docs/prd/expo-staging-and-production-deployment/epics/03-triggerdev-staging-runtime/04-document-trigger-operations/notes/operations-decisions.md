# Operations Decisions

## Must Document

- Trigger.dev Development worker is the runtime for this no-paid-environment QA scope.
- Local `trigger.dev dev` is the required worker process for this scope.
- Production Trigger deploy command exists, but production rollout waits for production API and release-readiness decisions.
- Job/run evidence belongs in task artifacts or QA notes, not in generic runbook examples.

## Correlation Rule

Use `jobId` as the cross-system anchor:

- API queued response: `jobId`, `translationJobId`, `triggerRunId`.
- Trigger logs: payload `job_id`, Trigger run id.
- API polling: translation id and persisted `triggerRunId`.
- Mobile diagnostics: queued job and trigger run fields from `lib/api.ts`.

## Deferred Paid Environments

Staging and Preview Trigger.dev environments require an upgrade. Keep this epic on Development until the account plan changes.

## Redaction Rule

Runbooks may include command shapes and variable names. They must not include real session tokens, secret values, private audio contents, or unapproved transcripts.
