---
phase: 3
worktree_mode: main
conflict_risk: none
branch: feat/preview-04-verify-diagnostics
depends_on: [install-preview-on-iphone]
blocks: []
---

# Execution Strategy - verify-preview-app-diagnostics

Phase 3. Run after the iPhone build is installed and launches. This is sequential because it needs physical-device evidence from `install-preview-on-iphone`.

Primary work is runtime verification, not code editing: open the installed app, capture the API chip and diagnostics panel, confirm the API URL is HTTPS and non-local, verify auth entry reachability, and optionally trigger only a lightweight health check. Use EAS build evidence from Task 01 for profile/channel/environment because the app does not display those values. Any local URL, malformed URL, wrong host, missing diagnostics, or auth/health failure blocks the next fresh-user E2E epic until classified.
