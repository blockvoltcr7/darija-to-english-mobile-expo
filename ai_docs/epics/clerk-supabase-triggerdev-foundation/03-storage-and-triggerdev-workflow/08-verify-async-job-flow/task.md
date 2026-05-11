# Task 08: Verify Async Job Flow

## Type

Code

## Context

Epic 03 is complete only when the whole async chain works: Clerk-authenticated submission, private Supabase Storage upload, queued Supabase job, Trigger.dev execution, provider persistence, authenticated polling/history retrieval, and safe failure handling. This final task is the proof gate before moving to Epic 04 usage controls and retention automation.

## Implementation

- Run API verification for unauthenticated rejection, authenticated async submit, storage object creation, queued job state, Trigger.dev run dispatch, worker transition to running, and terminal succeeded/failed state.
- Use Supabase MCP against project `npjsersrmvltoxmqdkzd` to verify bucket rows, `storage.objects`, `translation_jobs`, `translation_results`, and `provider_runs`.
- Use Trigger.dev MCP against project `proj_tehveeweadzwantwpvpr` to inspect worker, task schema, triggered run, run trace, and failure diagnostics.
- Verify mobile polling manually or with simulator notes, including successful result rendering and safe failed-job display.
- Clean up test storage objects and rows through Storage/API-safe paths; record any rows/objects intentionally retained.

## Acceptance Criteria

- [ ] Unauthenticated requests to async submit and history/detail are rejected before paid work.
- [ ] Authenticated async submit creates a private Storage object and queued job with matching bucket/key/size/MIME metadata.
- [ ] Trigger.dev run is visible and tied to `translation_jobs.trigger_run_id`.
- [ ] Job reaches `running` then `succeeded` with result/provider rows, or `failed` with safe durable error fields.
- [ ] Authenticated history/detail shows only the owning Clerk user's job and result.
- [ ] Mobile polling renders progress, success, and failure states.
- [ ] Test objects/rows are cleaned up or explicitly documented.

## Dependencies

- Depends On: add-mobile-job-polling
- Blocks: 04-usage-controls-and-release-readiness/create-usage-ledger-schema
- Blocks: 04-usage-controls-and-release-readiness/add-storage-retention-cleanup

## Technical Notes

- Final QA should run the standard repo checks after code changes: `node --check server/index.mjs`, checks for any new server/trigger modules, `npm run typecheck`, `npm run lint`, and `npx expo-doctor`.
- Include `curl http://localhost:8787/health` and `curl http://localhost:8787/health/supabase` when the local API is running.
- Confirm private bucket posture with a mobile/public-style denial check and a server/worker success check.
- Do not delete Storage objects via SQL. Use Supabase Storage remove helpers.
- Record Trigger.dev run IDs and Supabase row IDs in artifacts only when they are test data and not secrets.

## Artifact Slots

- `artifacts/`: final QA summary, API traces, Supabase MCP checks, Trigger.dev run output, screenshots, and cleanup evidence.
- `references/`: async QA checklist, storage privacy checklist, and Trigger.dev run inspection notes.
- `resources/`: curl commands, fixture payload instructions, and cleanup commands.
- `notes/`: QA findings, residual risks, provider-cost notes, and blockers for Epic 04.
