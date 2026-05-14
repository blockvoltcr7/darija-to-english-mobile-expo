---
phase: 2
worktree_mode: parallel
conflict_risk: low
branch: feat/eas-02-audit-mobile-secret-boundary
depends_on: [configure-eas-public-environments]
blocks: [update-env-examples-and-agent-notes]
---

# Execution Strategy - audit-mobile-secret-boundary

Run after EAS public env values are configured. This can run in parallel with `add-non-local-api-diagnostics` because the audit is mostly read-only inspection plus task-local sanitized evidence, while diagnostics is expected to modify app code.

Inspect EAS env names, `.env.example`, `AGENTS.md`, `lib/config.ts`, `app/`, `server/`, and `trigger/` for boundary violations. Do not print `.env.local` or secret values. If an unsafe public env or mobile direct provider call is found, fix or block before preview build work continues.

This task blocks documentation updates because `.env.example` and agent notes should reflect the audited boundary, not assumptions.
