---
phase: 1
worktree_mode: main
conflict_risk: medium
branch: codex/eas-00-initialize-eas-project
depends_on: []
blocks: [create-eas-build-profiles, document-native-identity-assumptions, verify-eas-config]
---

# Execution Strategy - initialize-eas-project

Phase 1 starts the epic because every later EAS build-profile and verification task depends on knowing whether the project is already associated with EAS or whether `npx eas-cli@latest init` must run.

Execute in the parent session on the main worktree. The task may update `app.json` with `expo.extra.eas.projectId`, and it may encounter Expo account prompts, so it should stay parent-owned rather than delegated. Preserve the native identifiers in `app.json`; if EAS auth or account selection blocks initialization, document the sanitized blocker in task artifacts instead of guessing.

Conflict risk is medium because `app.json` is a shared release/config file and EAS initialization can be interactive/account-scoped. Do not proceed to Task 02 until this task either records a project association or records a precise blocker.
