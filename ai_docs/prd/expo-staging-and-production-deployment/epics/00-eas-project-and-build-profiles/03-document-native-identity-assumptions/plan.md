---
phase: 3
worktree_mode: main
conflict_risk: low
branch: codex/eas-00-document-native-identity
depends_on: [create-eas-build-profiles]
blocks: [verify-eas-config]
---

# Execution Strategy - document-native-identity-assumptions

Phase 3 documents source-controlled app identity and external account assumptions after the final `eas.json` profile shape exists. This ordering keeps the deployment runbook aligned with the actual EAS lanes.

Execute in the parent session on the main worktree. Create or update `ai_docs/deployment/README.md` with the current app identity values from `app.json`, and clearly separate source-controlled identifiers from Apple Developer, Google Play, and Expo account ownership assumptions.

Conflict risk is low because this is documentation-only unless current source values force a clarification. Do not change app name, slug, scheme, bundle identifier, Apple Team ID, Android package, or EAS profile behavior in this task.
