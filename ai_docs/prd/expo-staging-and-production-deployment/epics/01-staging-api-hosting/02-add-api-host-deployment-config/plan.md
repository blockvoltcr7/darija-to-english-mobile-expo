---
phase: 2
worktree_mode: sequential
conflict_risk: high
branch: codex/staging-api-02-deploy-config
depends_on: [select-node-api-host]
blocks: [verify-staging-api-health]
---

# Execution Strategy - add-api-host-deployment-config

Phase 2 starts with the Cloud Run deployment shape after the host is selected. Keep this task sequential with `configure-staging-api-environment` because both tasks must agree on the same project, region, Cloud Run service name, service account, Secret Manager strategy, and deploy command.

Execute in the parent session on the main worktree. Add only the minimal config needed to deploy the existing Express API entrypoint. Preserve `server/index.mjs` as the API contract owner and keep the startup path aligned with `npm run api`, `PORT`, and `HOST`. Prefer service name `darija-api-staging` unless execution reveals a concrete naming issue.

Conflict risk is high because this can touch root deployment files, package scripts, Docker config, and task artifacts that downstream deployment and verification depend on. Do not add Terraform, load balancers, Cloud Armor, custom domains, or API route refactors in this task.
