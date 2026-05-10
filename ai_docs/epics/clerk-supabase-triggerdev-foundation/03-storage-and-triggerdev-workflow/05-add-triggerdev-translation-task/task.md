# Task 05: Add Trigger.dev Translation Task

## Type

Code

## Context

The async worker should process a job by ID, read audio from Supabase Storage, call providers, and write durable results.

## Implementation

- Add a Trigger.dev task that accepts `job_id`.
- Load the job, mark it `running`, read audio from the private bucket, call Modal and OpenAI, write provider runs/results, and mark final status.
- Handle provider failures with safe errors.

## Acceptance Criteria

- Task updates job status to `running` then `succeeded` or `failed`.
- Provider runs and final results are written to Supabase.
- Duplicate execution is idempotent or guarded against repeated expensive provider calls.

## Dependencies

- Depends On: add-triggerdev-project-config

## Technical Notes

- Supabase remains the source of truth; Trigger.dev only executes.
- Use the event workflow visual as the task flow reference.

## Artifact Slots

- `artifacts/`: task run logs and result examples.
- `references/`: event workflow visual and provider pipeline notes.
- `resources/`: sample job payloads.
- `notes/`: idempotency and retry decisions.
