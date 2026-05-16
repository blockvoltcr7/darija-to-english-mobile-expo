---
phase: 2
worktree_mode: main
conflict_risk: low
branch: codex/eas-00-create-eas-build-profiles
depends_on: [initialize-eas-project]
blocks: [document-native-identity-assumptions, verify-eas-config]
---

# Execution Strategy - create-eas-build-profiles

Phase 2 creates the root `eas.json` after the EAS project-association state is known. This task should remain sequential because later documentation and verification need to reflect the exact profile matrix committed here.

Execute in the parent session on the main worktree. Add `development`, `preview`, `staging`, and `production` build profiles plus `staging` and `production` submit placeholders. Keep API URLs and server-side provider secrets out of `eas.json`; those belong to later EAS environment and backend-hosting work.

Conflict risk is low because this task primarily creates a new root config file. The main decision point is whether `build.staging.environment` uses the PRD's `preview` environment or a dedicated `staging` environment. If the implementation chooses dedicated `staging`, record that deviation in the task notes before marking the task done.
