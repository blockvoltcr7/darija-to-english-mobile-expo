# Task 04: Run Release Readiness QA

## Type

QA

## Context

The migration is not done until a fresh Clerk user can complete the full translation workflow and history isolation passes without Supabase.

## Implementation

- Run static checks.
- Start Convex, API, and Trigger worker.
- Create or sign into a fresh Clerk test user.
- Upload a non-sensitive audio fixture.
- Verify realtime status, results, provider metadata, and diagnostics.
- Verify history isolation with a second user.
- Capture sanitized evidence.

## Acceptance Criteria

- Static checks pass.
- `/health` passes and reports Convex.
- Fresh user translation succeeds.
- Result sections all render.
- History isolation passes.
- Rollback path is documented.

## Dependencies

- `update-agent-docs-and-runbooks`

## Validation Commands

```bash
node --check server/index.mjs
npm run typecheck
npm run lint
npx expo-doctor
curl http://localhost:8787/health
npx convex dev
npm run trigger:dev
```

## Artifact Slots

- `artifacts/`: final QA summary.
- `notes/`: release blockers and rollback decision.

