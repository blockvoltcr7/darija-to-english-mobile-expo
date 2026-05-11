# Task 06: Dispatch Trigger.dev From API

## Type

Code

## Context

The current authenticated route `POST /v1/translate-audio` blocks until provider processing finishes. After Tasks 01-05, the app can create a queued job, store original audio, and hand execution to Trigger.dev. This task adds the async submission API while preserving Clerk verification, profile upsert, server-only Storage access, and Supabase-owned job state.

## Implementation

- Add `POST /v1/translations` in `server/index.mjs` after `requireClerkSession` and `ensureProfileForRequest`.
- Reuse existing payload normalization from `/v1/translate-audio`, create a queued job through `server/translations.mjs`, upload original audio through `server/storage.mjs`, attach storage metadata, and trigger `translate-audio-job` with `{ job_id }`.
- Use Trigger.dev idempotency key `translation-job:<job_id>` and store the returned `trigger_run_id` on `translation_jobs`.
- Return a fast async response with `job_id`, `status: "queued"`, `trigger_run_id` if available, and the polling target consumed by mobile.
- Keep `/v1/translate-audio` as a temporary compatibility route unless this task explicitly records a retirement decision.

## Acceptance Criteria

- [ ] Auth failure rejects before DB, Storage, Trigger.dev, Modal, or OpenAI work.
- [ ] `POST /v1/translations` creates a queued job, stores original audio, dispatches Trigger.dev, and returns quickly.
- [ ] `translation_jobs.trigger_run_id` is stored when dispatch succeeds.
- [ ] Provider calls do not execute in the async request path.
- [ ] Dispatch failure produces a durable safe failure state or documented retryable recovery path.
- [ ] `/v1/translate-audio` compatibility behavior is documented and left working unless intentionally changed.

## Dependencies

- Depends On: add-triggerdev-translation-task
- Blocks: add-mobile-job-polling
- Blocks: verify-async-job-flow

## Technical Notes

- Existing history routes are `GET /v1/translations` and `GET /v1/translations/:id`; this task adds the missing async `POST /v1/translations` contract.
- Existing `lib/api.ts` posts sync payloads to `/v1/translate-audio`; mobile changes belong in Task 07.
- Use `traceFromRequest(req)` for correlation and pass trace/job metadata through Supabase rows, not through Trigger payload secrets.
- Shared files likely touched: `server/index.mjs`, `server/translations.mjs`, `server/storage.mjs`, `server/env.mjs`, `.env.example`, and `lib/types.ts`.

## Artifact Slots

- `artifacts/`: async API response examples, Trigger dispatch trace, DB row examples, and failure evidence.
- `references/`: sequence diagram, event workflow diagram, and Trigger triggering docs.
- `resources/`: authenticated curl commands for success, invalid auth, oversized file, and dispatch failure.
- `notes/`: route compatibility decision, dispatch failure policy, and response-shape decision.
