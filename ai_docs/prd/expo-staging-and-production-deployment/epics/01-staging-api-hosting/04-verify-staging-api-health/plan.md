---
phase: 3
worktree_mode: main
conflict_risk: medium
branch: codex/staging-api-04-health
depends_on: [add-api-host-deployment-config, configure-staging-api-environment]
blocks: [document-api-operations]
---

# Execution Strategy - verify-staging-api-health

Phase 3 verifies the staged API only after deployment config and environment configuration are both in place. The gate is HTTPS `/health`, not a paid translation call.

Execute in the parent session on the main worktree. Deploy or inspect the Cloud Run service using the selected workflow, then run `curl https://<staging-api>/health`, confirm the expected response shape, and verify logs show the request. Capture sanitized health output and log evidence in task artifacts.

Conflict risk is medium because this task depends on external Cloud Run state and may surface missing env, IAM, or dependency issues. Do not run paid provider translation calls unless the health check is already passing and the task scope is explicitly expanded.
