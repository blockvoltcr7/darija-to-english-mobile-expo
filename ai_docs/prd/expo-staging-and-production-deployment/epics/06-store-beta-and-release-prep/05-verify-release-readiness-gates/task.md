# Task 05: Verify Release Readiness Gates

## Type

Code

## Context

This final gate determines whether the app is ready for store beta or whether it should remain in staging. It must distinguish deployment readiness from full public-release readiness.

## Implementation

- Review completion evidence from all previous epics.
- Verify required commands pass where applicable:
  - `node --check server/index.mjs`
  - `node --check trigger/translate-audio-job.mjs`
  - `npm run typecheck`
  - `npm run lint`
  - `npx expo-doctor`
  - `curl https://<staging-api>/health`
- Confirm staging E2E succeeded with fresh Clerk user.
- Confirm store beta build status.
- Check whether usage-control Epic 04 is complete before recommending wider beta/public release.
- Write a go/no-go recommendation.

## Acceptance Criteria

- Release-readiness summary exists.
- Go/no-go recommendation is explicit.
- Staging E2E, API health, Trigger success, and build status are represented.
- Any blockers are assigned to the correct domain: mobile, API, Trigger, provider, EAS/store, or usage controls.

## Dependencies

- Depends On: add-release-rollback-checklist

## Technical Notes

- A store beta go may still be a public-release no-go if usage controls, legal docs, or account deletion are incomplete.
- Do not overclaim production readiness from preview-only evidence.

## Artifact Slots

- `artifacts/`: final readiness report and command output summary.
- `references/`: prior epic evidence links.
- `resources/`: verification command list.
- `notes/`: go/no-go decision and residual risks.

