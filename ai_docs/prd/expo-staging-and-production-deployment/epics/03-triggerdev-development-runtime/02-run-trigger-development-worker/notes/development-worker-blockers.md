# Development Worker Blockers

Use this file during execution if the Development worker cannot connect.

## Known Likely Blockers

- Trigger CLI not authenticated.
- User lacks access to project ref from `TRIGGER_PROJECT_REF`.
- CLI is pointed at a paid additional environment instead of Development.
- Required Trigger env vars are missing.
- Bundle cannot resolve server-side imports from `trigger/translate-audio-job.mjs`.

## Resolved During Phase 2

- Timestamp: `2026-05-15T18:37:21Z`
- Command: `npm run trigger:dev -- --env-file .env.local --skip-update-check`
- Sanitized error: `sh: trigger.dev: command not found`
- Classification: local npm script binary mismatch
- Resolution: update `package.json` scripts to use the installed `trigger` binary.
- Result after fix: local worker ready.

## Blocker Entry Template

- Timestamp:
- Command:
- Sanitized error:
- Classification: auth | project access | environment | secret | bundling | network | unknown
- Owner:
- Next command or UI action:
