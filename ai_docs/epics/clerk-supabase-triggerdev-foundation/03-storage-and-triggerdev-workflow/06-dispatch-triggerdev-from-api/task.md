# Task 06: Dispatch Trigger.dev From API

## Type

Code

## Context

The API should create a queued job quickly and dispatch Trigger.dev, rather than blocking mobile requests on provider work.

## Implementation

- Add or update `POST /v1/translations`.
- Verify Clerk, ensure profile, store audio, create queued job, dispatch Trigger.dev with `job_id`.
- Store `trigger_run_id` on the job.
- Keep the old sync route temporarily if compatibility requires it.

## Acceptance Criteria

- API returns `job_id` and queued status quickly.
- `trigger_run_id` is stored.
- Provider calls are no longer required in the request path for the async route.

## Dependencies

- Depends On: add-triggerdev-translation-task

## Technical Notes

- Preserve strict Clerk verification before dispatch.
- Keep `/v1/translate-audio` compatibility decision documented.

## Artifact Slots

- `artifacts/`: API response examples and Trigger.dev dispatch traces.
- `references/`: sequence and event workflow diagrams.
- `resources/`: curl commands.
- `notes/`: route compatibility decisions.
