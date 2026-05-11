# Task 01: Create Usage Ledger Schema

## Type

Migration

## Context

Before beta, usage must be trackable by Clerk user and job so provider spend can be controlled.

## Implementation

- Add append-only `usage_ledger`.
- Include `clerk_user_id`, optional `job_id`, `entry_type`, seconds, estimated cost, reason, and timestamp.
- Support entry types: `reservation`, `final_charge`, `release`, `adjustment`.

## Acceptance Criteria

- Usage entries are tied to `clerk_user_id`.
- Usage entries can reference jobs.
- Normal operation appends entries rather than mutating old charges.

## Dependencies

- Depends On: 03-storage-and-triggerdev-workflow/verify-async-job-flow

## Technical Notes

- Keep billing/RevenueCat out of this task.
- The schema should support free allowance enforcement.

## Artifact Slots

- `artifacts/`: migration SQL and sample ledger rows.
- `references/`: ERD/future billing notes.
- `resources/`: SQL check commands.
- `notes/`: ledger semantics decisions.
