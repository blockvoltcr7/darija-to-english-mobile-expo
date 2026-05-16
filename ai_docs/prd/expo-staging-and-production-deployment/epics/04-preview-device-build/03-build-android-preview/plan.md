---
phase: 1
worktree_mode: parallel
conflict_risk: low
branch: feat/preview-03-android-preview-build
depends_on: []
blocks: []
---

# Execution Strategy - build-android-preview

Phase 1. This can run in parallel with `build-ios-preview` because it writes only task-local Android evidence and notes. It does not block iPhone install or diagnostics unless the user explicitly makes Android active for this run.

Primary work is to decide Android scope first. If Android is active, verify EAS auth, package/profile/env shape, run the Android `preview` build, and require an installable APK for direct device/emulator evidence. If Android is deferred, fill the Android evidence template with the deferral reason and next trigger, then complete the task without blocking the iOS path.
