# Task 01: Port Worker Job Claiming

## Type

Code

## Context

The worker currently claims only queued Supabase jobs. Convex needs an atomic claim mutation with status, attempt, and lock metadata.

## Implementation

- Add an internal mutation to claim a job by public job ID.
- Require current status to be `queued` or eligible `retrying`.
- Set `running`, `startedAt`, `attemptCount`, `lockExpiresAt`, and `triggerRunId`.
- Return a safe worker payload with storage ID and metadata.

## Acceptance Criteria

- Duplicate worker invocations cannot both claim the same job.
- Non-queued terminal jobs are skipped safely.
- Claim result includes enough data to process the audio.
- Claim logs do not expose secrets or audio content.

## Dependencies

- Epic 03 complete.

## Validation Commands

```bash
npx convex dev
npm run trigger:dev
npm run typecheck
```

## Artifact Slots

- `artifacts/`: duplicate-claim test notes.
- `references/`: old Supabase claim function excerpt.

