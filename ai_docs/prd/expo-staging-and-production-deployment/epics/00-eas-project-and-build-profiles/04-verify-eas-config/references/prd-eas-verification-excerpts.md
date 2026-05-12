# PRD EAS Verification Excerpts

Task 04 verifies Epic 00 output against the deployment PRD.

## PRD 05 Technical Specifications

Required `eas.json` expectations:

- `cli.version`
- `cli.appVersionSource`
- `build.development`
- `build.preview`
- `build.staging`
- `build.production`
- `submit.staging`
- `submit.production`

Required profile names:

- `development`
- `preview`
- `staging`
- `production`

## PRD 08 Definition Of Done

Relevant checks:

- `eas.json` exists with all four profiles.
- EAS project is initialized and associated with the Expo app.
- Native identifiers remain aligned with `app.json`.
- Verification commands pass or blockers are documented.
- Server/API/Trigger deployment is outside Epic 00.

## Verification Boundary

This task validates configuration and static checks. It should not start API hosting, Trigger.dev deployment, TestFlight submission, Google Play submission, or production release work.
