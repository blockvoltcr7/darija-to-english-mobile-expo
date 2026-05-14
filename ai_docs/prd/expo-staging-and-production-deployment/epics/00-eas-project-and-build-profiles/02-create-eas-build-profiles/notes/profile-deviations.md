# Profile Deviations

Record any intentional deviation from PRD `05-technical-specifications.md`.

## Current Deviations

- Field: `build.staging.environment`
- PRD value: `preview`
- Earlier implemented value: `staging`
- Current implemented value: `preview`
- Reason: Epic 02 found custom EAS environments require a paid Expo Production or Enterprise plan. Use default `preview` for both preview and staging builds until the account supports a separate staging environment.
- Follow-up impact: If the Expo account upgrades later, move `build.staging.environment` back to `staging` and configure separate mobile-safe public values there.

## Deviation Template

- Field:
- PRD value:
- Implemented value:
- Reason:
- Follow-up impact:

## Common Conditional Deviation

If `build.staging.environment` is set to `staging` instead of `preview`, record it here and carry that decision into Epic 02 EAS environment setup.
