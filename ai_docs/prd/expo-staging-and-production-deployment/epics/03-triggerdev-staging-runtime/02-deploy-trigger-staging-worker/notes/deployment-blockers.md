# Deployment Blockers

Use this file during execution if deployment cannot complete.

## Known Likely Blockers

- Trigger CLI not authenticated.
- User lacks access to project ref from `TRIGGER_PROJECT_REF`.
- `staging` environment does not exist or is named differently.
- Required Trigger env vars are missing.
- Bundle cannot resolve server-side imports from `trigger/translate-audio-job.mjs`.

## Blocker Entry Template

- Timestamp:
- Command:
- Sanitized error:
- Classification: auth | project access | environment | secret | bundling | network | unknown
- Owner:
- Next command or UI action:
