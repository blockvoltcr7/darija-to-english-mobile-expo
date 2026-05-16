# Task 02: Install Preview On iPhone

## Type

Infrastructure

## Context

PRD Phase 5 requires real-device iOS validation before E2E QA. A successful EAS build is not enough: the build must install and launch on the target physical iPhone so networking, native auth, document picking, and diagnostics can be validated outside the simulator. The primary path is EAS internal distribution from the Task 01 `preview` build; TestFlight remains a fallback for the later store-beta epic unless internal distribution is blocked.

## Implementation

- Start from the Task 01 iOS build ID or URL; do not substitute simulator evidence.
- Confirm the build uses the expected native identity from `app.json` and the `preview` profile unless Task 01 documented a `development` fallback.
- When account access allows, run `npx eas-cli@latest device:list --apple-team-id 57JWLP426D` to confirm the iPhone is registered for ad hoc/internal distribution.
- Install from the EAS build detail page using Install link, QR flow, or Expo Orbit.
- If the iPhone was registered after the build, document whether the build needs rebuild or `eas build:resign`.
- Launch the app from the iPhone home screen and confirm landing/sign-in is reachable.
- Record sanitized install evidence in the artifact template.

## Human-In-The-Loop

- Human must physically operate the iPhone for install, QR scanning, profile trust prompts, home-screen launch, and any iOS confirmation dialogs.
- Human must provide or confirm the target iPhone device registration/UDID status if EAS or Apple account access cannot verify it programmatically.
- Human must approve any Apple/EAS browser action that changes device registration, re-signs an artifact, or modifies account/provisioning state.
- Human must provide screenshots or live observations from the iPhone when Codex cannot inspect the physical screen directly.
- Codex can inspect EAS build metadata, run device/build listing commands, classify blockers, and fill sanitized evidence after the human/device steps.

## Acceptance Criteria

- [ ] Physical iPhone install succeeds, or the blocker identifies device registration, provisioning, credentials, or build artifact access.
- [ ] Evidence records build ID/URL handling, profile, install method, device model/iOS version, and launch result.
- [ ] App opens from the iPhone home screen without requiring simulator-only behavior.
- [ ] User can reach landing/sign-in/auth entry.
- [ ] Visible API chip is non-local, or the mismatch is recorded for Task 04 to block E2E QA.
- [ ] Screenshots and notes do not expose private account details, tokens, secret values, or install links in public-ready text.

## Dependencies

- Depends On: build-ios-preview
- Blocks: verify-preview-app-diagnostics

## Technical Notes

- EAS internal iOS distribution uses ad hoc provisioning; a device missing from the provisioning profile can fail install even when the build succeeded.
- Newly registered devices may require a rebuild or re-sign before installation works.
- Expo internal-distribution builds launch without a development server; a development-client fallback may have different runtime expectations and must be documented.
- `app/translate.tsx` already exposes the active API URL in the header chip and diagnostics panel for Task 04.
- Computer Use can help inspect EAS web UI, but it cannot complete the physical iPhone install or bypass iOS device prompts.

## Artifact Slots

- `references/eas-ios-internal-install-notes.md`: internal distribution and device registration source notes.
- `resources/iphone-install-checklist.md`: install and device-registration commands.
- `artifacts/install-evidence-template.md`: sanitized physical-device install evidence.
- `notes/device-registration-blockers.md`: Apple account, UDID, provisioning, rebuild, or re-sign blockers.
