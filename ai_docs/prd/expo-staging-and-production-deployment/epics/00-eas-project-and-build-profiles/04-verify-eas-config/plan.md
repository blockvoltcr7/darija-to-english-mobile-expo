---
phase: 4
worktree_mode: main
conflict_risk: medium
branch: codex/eas-00-verify-eas-config
depends_on: [create-eas-build-profiles, document-native-identity-assumptions]
blocks: []
---

# Execution Strategy - verify-eas-config

Phase 4 is the final gate for Epic 00. It verifies the committed EAS config, source identity, deployment docs, and static project checks after Tasks 02 and 03 are complete.

Execute in the parent session on the main worktree. Run the required checks from the task spec and resource file: `npm run typecheck`, `npm run lint`, `npx expo-doctor`, JSON/profile validation for `eas.json`, and safe EAS CLI inspection commands when account access allows. If EAS auth, Apple credentials, or remote project state blocks inspection, record the sanitized blocker in artifacts instead of claiming success.

Conflict risk is medium because this task reads every prior output and may add verification artifacts or blocker notes. It should not start a cloud build, deploy the API, deploy Trigger.dev, configure EAS public env vars, or alter app runtime behavior.
