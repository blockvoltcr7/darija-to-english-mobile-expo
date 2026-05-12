# Task 04: Verify EAS Config

## Type

Code

## Context

PRD `08-definition-of-done.md` requires `eas.json`, EAS association, stable identifiers, and verification commands before phone QA can depend on cloud builds. This task confirms Epic 00 output is syntactically valid and internally consistent, while intentionally avoiding API hosting, Trigger deployment, or actual preview build execution.

## Implementation

- Run repo checks from `AGENTS.md`: `npm run typecheck`, `npm run lint`, and `npx expo-doctor`.
- Validate `eas.json` as JSON and inspect the resolved profile names. Prefer safe commands such as `npx eas-cli@latest config` or `npx eas-cli@latest build:inspect --profile preview --platform ios` when supported by the installed CLI.
- Confirm profiles match PRD `05`: `development`, `preview`, `staging`, and `production`.
- Confirm identity docs match current `app.json` values and do not contradict `eas.json`.
- If EAS commands require Expo login, Apple credentials, or remote account state, record the exact blocker under `artifacts/` and do not claim validation succeeded.
- Do not start a cloud build unless the task is explicitly expanded.

## Acceptance Criteria

- [ ] TypeScript, lint, and Expo Doctor pass, or failures are documented with clear ownership.
- [ ] `eas.json` parses and exposes all four required profiles.
- [ ] EAS validation/inspection passes, or the exact Expo auth/account blocker is documented.
- [ ] App identity docs and `app.json` agree on native identifiers.
- [ ] No app runtime behavior, API route, Trigger task, or provider config is changed.

## Dependencies

- Depends On: `create-eas-build-profiles`
- Depends On: `document-native-identity-assumptions`
- Blocks: `../02-eas-environments-and-config-safety/01-configure-eas-public-environments`
- Blocks: `../04-preview-device-build/01-build-ios-preview`
- Blocks: `../04-preview-device-build/03-build-android-preview`

## Technical Notes

- `AGENTS.md` also lists `node --check server/index.mjs`, but Epic 00 does not change server code; run it only if touched files or package changes make server verification relevant.
- `eas.json` does not exist before Task 02; this task should fail fast with a clear dependency note if Task 02 is incomplete.
- Keep EAS auth output sanitized. Expo account emails and project IDs are acceptable only if the user is comfortable committing them; otherwise record redacted evidence.
- Validation should prepare, not replace, the later preview build tasks.

## Artifact Slots

- `artifacts/`: sanitized command outputs, validation summary, and auth/account blockers.
- `references/`: final profile matrix, identity doc excerpts, and PRD `05` / `08` references.
- `resources/`: repeatable validation command list for future implementers.
- `notes/`: unresolved blockers, deferred cloud-build decisions, and follow-up ownership.
