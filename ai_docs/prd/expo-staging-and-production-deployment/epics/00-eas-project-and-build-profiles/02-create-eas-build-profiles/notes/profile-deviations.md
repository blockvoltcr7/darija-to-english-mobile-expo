# Profile Deviations

Record any intentional deviation from PRD `05-technical-specifications.md`.

## Current Deviations

- Field: `build.staging.environment`
- PRD value: `preview`
- Implemented value: `staging`
- Reason: keep owner-device preview and store-beta staging as separate QA lanes.
- Follow-up impact: Epic 02 must configure a dedicated EAS `staging` environment with mobile-safe public values.

## Deviation Template

- Field:
- PRD value:
- Implemented value:
- Reason:
- Follow-up impact:

## Common Conditional Deviation

If `build.staging.environment` is set to `staging` instead of `preview`, record it here and carry that decision into Epic 02 EAS environment setup.
