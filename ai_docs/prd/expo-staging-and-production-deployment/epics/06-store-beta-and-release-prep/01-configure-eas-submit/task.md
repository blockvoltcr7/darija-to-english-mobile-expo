# Task 01: Configure EAS Submit

## Type

Infrastructure

## Context

After staging E2E passes, the app needs a repeatable path to submit store beta builds through EAS Submit. Credentials and store setup may require user-owned account actions.

## Implementation

- Inspect `eas.json` submit placeholders.
- Document required App Store Connect and Google Play Console access.
- Configure EAS Submit only when credentials and app records are ready.
- Keep credentials out of source control.
- Capture blockers for Apple team, app record, bundle ID, Google service account, or package setup.

## Acceptance Criteria

- EAS Submit path is configured or blocked with precise account requirements.
- Submit profiles remain aligned with staging and production build profiles.
- No store credentials are committed.
- Store beta tasks can proceed when account setup is complete.

## Dependencies

- Depends On: 05-staging-e2e-qa/capture-staging-qa-evidence

## Technical Notes

- Do not submit to public production release in this task.
- Store setup may be manual and should be documented plainly.

## Artifact Slots

- `artifacts/`: sanitized submit config review or blocker evidence.
- `references/`: EAS Submit and store account notes.
- `resources/`: submit commands and credential checklist.
- `notes/`: account ownership decisions.

