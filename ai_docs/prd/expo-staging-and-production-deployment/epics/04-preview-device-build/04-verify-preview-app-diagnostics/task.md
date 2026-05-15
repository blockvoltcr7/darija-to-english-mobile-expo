# Task 04: Verify Preview App Diagnostics

## Type

Code

## Context

Before fresh-user E2E QA, the installed iPhone build must prove it is using a non-local HTTPS API target and mobile-safe public config. This guards against false QA caused by simulator URLs such as `localhost`, `127.0.0.1`, or `10.0.2.2`. The app currently exposes the active API URL through `app/translate.tsx`; build profile and Clerk environment are not shown in-app and must be correlated from EAS build/env evidence instead.

## Implementation

- Open the installed iPhone build from Task 02 and navigate to the signed-out landing/auth entry and signed-in translate screen as available.
- Use `app/translate.tsx` diagnostics: header chip renders `CONFIG.API_BASE_URL`, and the diagnostics panel logs the initial API target line.
- Capture screenshot evidence of the API chip and expanded diagnostics panel.
- Trigger only a lightweight API health check through the app flow when possible; do not run paid provider translation in this task.
- Pass only when the API URL is HTTPS and not `localhost`, `127.0.0.1`, `10.0.2.2`, or a wrong host.
- Record build profile/channel/environment from Task 01 evidence, not from an invented app-side signal.
- Verify auth entry is reachable without copying Clerk tokens or session IDs.

## Acceptance Criteria

- [ ] Installed iPhone build shows a non-local HTTPS API URL in the visible app UI.
- [ ] Expanded diagnostics evidence includes the API target line and no local-target warning.
- [ ] Auth entry is reachable from the installed build.
- [ ] Lightweight health-check evidence records HTTP success or a precise owner for failure.
- [ ] Evidence correlates device, build ID/profile, API URL, screenshots, and blocker notes.
- [ ] Any local URL, malformed URL, missing diagnostics, or wrong host blocks E2E QA and is logged.
- [ ] No tokens, session IDs, Clerk key values, private account details, audio contents, or full transcripts are captured.

## Dependencies

- Depends On: install-preview-on-iphone
- Depends On: 02-eas-environments-and-config-safety/add-non-local-api-diagnostics
- Blocks: fresh-user E2E QA in the next epic

## Technical Notes

- `lib/config.ts` resolves `EXPO_PUBLIC_API_BASE_URL` and falls back to simulator/emulator defaults when unset.
- `app/translate.tsx` currently uses an older non-local API label; for this epic, verify the actual hostname and protocol, not just the label.
- The app does not currently display EAS build profile, channel, app version, or Clerk publishable-key environment.
- `app/AGENTS.md` requires diagnostics to preserve base URLs, health checks, queued job IDs, Trigger run IDs, and final UI state without token values.
- A development-client fallback may be acceptable only if Task 01 and Task 02 documented that path and Task 04 still verifies a non-local HTTPS API URL.

## Artifact Slots

- `references/expected-config-matrix.md`: profile/env/API expectations and UI source anchors.
- `resources/preview-diagnostics-checklist.md`: iPhone verification steps.
- `artifacts/diagnostics-evidence-template.md`: sanitized diagnostic evidence fields.
- `notes/config-mismatch-log.md`: local URL, malformed URL, auth, health, or profile mismatch log.
