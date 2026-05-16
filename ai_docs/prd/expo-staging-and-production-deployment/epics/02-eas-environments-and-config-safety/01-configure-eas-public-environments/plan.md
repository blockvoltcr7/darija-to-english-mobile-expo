---
phase: 1
worktree_mode: main
conflict_risk: none
branch: feat/eas-01-configure-public-environments
depends_on: []
blocks: [audit-mobile-secret-boundary, add-non-local-api-diagnostics]
---

# Execution Strategy - configure-eas-public-environments

Run this first on the main branch. It depends on completed cross-epic work from the EAS profile and Cloud Run staging API epics, but has no unresolved dependency inside this epic.

Primary work is external EAS configuration plus sanitized local evidence. Use the staging URL documented in `ai_docs/deployment/api-hosting.md` for preview and staging `EXPO_PUBLIC_API_BASE_URL`. Keep production pending unless a production API exists. Do not put server-owned provider keys in EAS public env.

This task blocks both the secret-boundary audit and the non-local diagnostics work because those tasks need the final intended public env shape.
