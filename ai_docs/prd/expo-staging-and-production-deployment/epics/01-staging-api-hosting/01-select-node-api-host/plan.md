---
phase: 1
worktree_mode: main
conflict_risk: low
branch: codex/staging-api-01-select-host
depends_on: []
blocks: [add-api-host-deployment-config, configure-staging-api-environment]
---

# Execution Strategy - select-node-api-host

Phase 1 locks the hosting decision before any deployment config or secret setup happens. The current project setup already points to Google Cloud project `darija-to-english-expo` in region `us-central1`, with billing and required APIs verified.

Execute in the parent session on the main worktree. Use Cloud Run as the expected default unless a concrete blocker appears during final host-fit checks. Record the host comparison, Cloud Run selection, request-size caveats for base64 audio JSON uploads, and any remaining account or quota blockers in task artifacts.

Conflict risk is low because this is a decision and documentation task. Do not change runtime code, deployment config, or secrets in this phase.
