# Task 04: Add Non-Local API Diagnostics

## Type

Code

## Context

Device QA needs a clear way to verify that a preview build is targeting the staging HTTPS API. The app has previously shown `localhost` in diagnostics; this must be impossible to miss in non-local QA.

## Implementation

- Inspect `lib/config.ts` and existing diagnostics UI.
- Add or refine app diagnostics to display the active API base URL safely.
- Consider a guard/warning that flags `localhost`, `127.0.0.1`, or `10.0.2.2` in preview/staging/production builds.
- Keep local simulator and Android emulator defaults working for development.
- Do not block local dev workflows unless a build-profile signal clearly indicates non-local build context.

## Acceptance Criteria

- QA can see or capture the active API base URL from the app.
- Preview/staging builds visibly indicate when a local API URL is configured.
- Local simulator and Android emulator development remain supported.
- `npm run typecheck` and `npm run lint` pass after code changes.

## Dependencies

- Depends On: configure-eas-public-environments

## Technical Notes

- Avoid exposing server secrets in diagnostics.
- The diagnostic should be useful in screenshots without revealing sensitive tokens.

## Artifact Slots

- `artifacts/`: screenshots or simulator/device diagnostic evidence.
- `references/`: `lib/config.ts` and relevant UI file excerpts.
- `resources/`: test matrix for local vs preview URLs.
- `notes/`: guard behavior decisions.

