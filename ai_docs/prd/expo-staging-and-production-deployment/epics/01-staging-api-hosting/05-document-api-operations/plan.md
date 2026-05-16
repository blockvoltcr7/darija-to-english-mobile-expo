---
phase: 4
worktree_mode: main
conflict_risk: low
branch: codex/staging-api-05-ops-docs
depends_on: [verify-staging-api-health]
blocks: []
---

# Execution Strategy - document-api-operations

Phase 4 writes the operations runbook after the staging API URL, deployment workflow, health result, and log access path are known.

Execute in the parent session on the main worktree. Create or update `ai_docs/deployment/api-hosting.md`, link it from `ai_docs/deployment/README.md`, and document the Cloud Run project boundary, service name, deploy command, staging API URL, health check command, logs, rollback/redeploy, known upload-size constraints, and required env var names only.

Conflict risk is low because this is documentation-focused. Do not include secret values, screenshots with secrets, or production cutover claims.
