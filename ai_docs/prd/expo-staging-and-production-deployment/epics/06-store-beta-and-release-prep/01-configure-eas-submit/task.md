# Task 01: Configure EAS Submit

## Type

Infrastructure

## Context

Epic 06 turns the verified real-phone QA path into a controlled store-beta path. The PRD Phase 7 goal is TestFlight / Google Play testing, not public launch. `eas.json` already contains empty `submit.staging` and `submit.production` placeholders; this task decides whether those placeholders can remain CLI-managed or need explicit submit config. Human account actions are expected because App Store Connect and Google Play Console ownership cannot be completed from source alone.

## Implementation

- Inspect `eas.json`, `app.json`, and `ai_docs/deployment/README.md` for current app identity, EAS project, build lanes, and submit placeholders.
- Use `npx eas-cli@latest submit:configure --platform ios` and/or `--platform android` only when the user has the needed store account access open and is ready for interactive credential/app-record prompts.
- If setup is not ready, document exact blockers instead of inventing config: Apple Developer membership, App Store Connect app record for `com.samisabiridrissi.darijatoenglish`, Google Play Console app/package ownership, and Google service account JSON/API access.
- Keep credentials, service account JSON, Expo tokens, Apple passwords, and private key material out of source control and screenshots.
- Add task-local support notes/checklists that make the next store-beta build task executable without guessing.

## Acceptance Criteria

- [ ] `eas.json` submit profiles are reviewed against current `staging` and `production` build profiles.
- [ ] EAS Submit is configured only if required store accounts/app records are available, or blockers are documented with the owning human action.
- [ ] App identity remains unchanged: iOS bundle ID and Android package stay `com.samisabiridrissi.darijatoenglish`.
- [ ] No store credential, token, service account JSON, password, private key, or secret value is committed or printed in artifacts.
- [ ] The follow-up build task has clear iOS and Android submit commands or clear no-go blockers.

## Dependencies

- Depends On: 05-staging-e2e-qa/capture-staging-qa-evidence
- Blocks: create-store-beta-builds

## Technical Notes

- Source identity lives in `app.json`; submit/build lane behavior lives in `eas.json`; deployment assumptions live in `ai_docs/deployment/README.md`.
- Current `staging` build profile uses `distribution: "store"`, `channel: "staging"`, and EAS `environment: "preview"` because custom Expo staging environments require a paid plan.
- EAS Submit uploads binaries into App Store Connect / Google Play distribution flows; it does not by itself approve public release.
- Human-in-loop is normal here for Apple login, App Store Connect agreements, app record creation, Google Play Console registration, and service account authorization.

## Artifact Slots

- `artifacts/`: sanitized submit configuration review or blocker template; no credential screenshots.
- `references/`: source-map excerpts for `eas.json`, `app.json`, and official EAS Submit docs.
- `resources/`: submit configure commands and store-account prerequisite checklist.
- `notes/`: account ownership decisions, human actions, and deferred-platform rationale.
