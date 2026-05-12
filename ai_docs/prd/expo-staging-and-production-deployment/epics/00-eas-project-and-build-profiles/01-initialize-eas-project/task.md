# Task 01: Initialize EAS Project

## Type

Infrastructure

## Context

PRD `04-architecture-plan.md` and `08-definition-of-done.md` require the app to move from local simulator runs to repeatable EAS-controlled builds. This task establishes the EAS project association for the existing Expo app without changing runtime behavior, native identifiers, provider calls, or the server/API deployment shape. It is the control-plane prerequisite for every later preview, staging, and production build lane.

## Implementation

- Inspect `app.json` for `expo.name`, `expo.slug`, `ios.bundleIdentifier`, `ios.appleTeamId`, and `android.package`; inspect `package.json` for Expo version and scripts.
- Check whether `app.json` already contains `expo.extra.eas.projectId` or whether `.eas/` local metadata indicates an existing association.
- Run `npx eas-cli@latest init` only if no association exists and the user is authenticated with the correct Expo account.
- If auth/account selection blocks the command, record the exact blocker under this task's `artifacts/` instead of guessing.
- Review any config diff before accepting it. Do not alter bundle IDs, package names, app name, slug, or provider env vars in this task.

## Acceptance Criteria

- [ ] EAS project association exists in source config, or a precise Expo account/auth blocker is documented.
- [ ] Evidence identifies the Expo app name, slug, iOS bundle ID, Android package, and resulting EAS project ID when available.
- [ ] No Expo account tokens, provider secrets, or local credentials are committed.
- [ ] `app.json` native identifiers remain `com.samisabiridrissi.darijatoenglish` unless a separate explicit decision changes them.

## Dependencies

- Depends On: none
- Blocks: `create-eas-build-profiles`
- Blocks: `document-native-identity-assumptions`
- Blocks: `verify-eas-config`

## Technical Notes

- Current source of truth is `app.json`, not PRD prose, if values ever diverge.
- `package.json` already uses Expo SDK dependencies and `expo-dev-client`; do not add deployment scripts here unless EAS initialization requires them.
- `eas init` can be interactive and account-scoped. Treat account prompts as user-owned external setup, not as a failed implementation.
- Keep `.env`, `.env.local`, OpenAI, Modal, Supabase service role, Clerk secret, and Trigger secrets out of all artifacts.

## Artifact Slots

- `artifacts/`: sanitized `eas init` output, EAS project ID evidence, or account-access blocker notes.
- `references/`: `app.json` metadata excerpts and PRD `04` / `08` references used.
- `resources/`: exact commands used, including any dry-run or inspection commands.
- `notes/`: Expo account ownership, Apple team, and app identity decisions.
