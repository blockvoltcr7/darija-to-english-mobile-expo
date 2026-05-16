---
phase: 2
worktree_mode: sequential
conflict_risk: high
branch: codex/staging-api-03-env-config
depends_on: [select-node-api-host]
blocks: [verify-staging-api-health]
---

# Execution Strategy - configure-staging-api-environment

Phase 2 continues with Cloud Run environment and secret configuration after the deployment shape is known. Keep this task sequential with `add-api-host-deployment-config` so env binding, service account, project, region, and service name stay consistent.

Execute in the parent session on the main worktree because this task has external GCP side effects. Inventory variable names from `server/env.mjs`, then configure or document required staging values without printing secrets. Prefer Secret Manager plus a dedicated Cloud Run runtime service account for long-lived secrets; direct Cloud Run env vars are acceptable for first staging only if the tradeoff is recorded.

Conflict risk is high because this task can alter Cloud Run service configuration and secret/IAM state outside the repo. Do not paste secret values into docs, logs, or summaries. Record only variable names and present/missing status.
