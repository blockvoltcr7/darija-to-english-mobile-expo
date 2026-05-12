# Task 03: Update Env Examples And Agent Notes

## Type

Infrastructure

## Context

Future implementers need clear environment examples for local simulator, physical device development, preview, staging, and production without accidentally copying secrets into public config.

## Implementation

- Update `.env.example` with non-secret examples for:
  - local iOS simulator API URL.
  - Android emulator API URL.
  - physical-device LAN API URL.
  - preview/staging HTTPS API URL placeholders.
  - production HTTPS API URL placeholder.
- Update `AGENTS.md` or deployment docs with the same environment distinctions.
- Ensure server-only variables are listed as server/API-host variables, not mobile public variables.
- Cross-link the deployment visual and PRD where helpful.

## Acceptance Criteria

- `.env.example` documents mobile public env values without secrets.
- Agent/deployment docs distinguish local simulator, physical device, staging, and production.
- Server-only values are clearly labeled as API/Trigger host config.
- Docs do not contradict `lib/config.ts` defaults.

## Dependencies

- Depends On: audit-mobile-secret-boundary

## Technical Notes

- Keep docs source-grounded and command-oriented.
- Do not add real key values.

## Artifact Slots

- `artifacts/`: doc update review notes.
- `references/`: prior AGENTS/env docs.
- `resources/`: env matrix.
- `notes/`: documentation decisions.

