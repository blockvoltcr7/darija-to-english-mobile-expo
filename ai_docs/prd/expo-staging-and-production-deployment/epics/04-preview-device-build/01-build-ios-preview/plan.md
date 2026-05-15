---
phase: 1
worktree_mode: parallel
conflict_risk: low
branch: feat/preview-01-ios-preview-build
depends_on: []
blocks: [install-preview-on-iphone, verify-preview-app-diagnostics]
---

# Execution Strategy - build-ios-preview

Phase 1. This can run in parallel with `build-android-preview` because it writes only task-local iOS evidence and notes. The shared risk is external rather than file-based: both platform build tasks may need the same EAS login, Expo account, and environment visibility, so coordinate account prompts in the parent session.

Primary work is infrastructure execution: verify `eas.json`, `app.json`, EAS auth, and public env visibility, then run the iOS `preview` build or document the exact EAS/Apple/device blocker. Keep any build URL private and record sanitized metadata in this task's artifact template. Do not mark complete until there is either a build ID/URL or a precise blocker with next action.
