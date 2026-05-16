---
phase: 2
worktree_mode: main
conflict_risk: none
branch: feat/preview-02-install-iphone
depends_on: [build-ios-preview]
blocks: [verify-preview-app-diagnostics]
---

# Execution Strategy - install-preview-on-iphone

Phase 2. Run after `build-ios-preview` produces an iOS build ID/URL or an installable artifact. This is sequential because it depends on the actual iOS build output and may require human action on the physical iPhone.

Primary work is device/install execution: verify device registration where account access allows, install through EAS Install link, QR flow, or Expo Orbit, launch from the iPhone home screen, and record sanitized install evidence. If device registration, provisioning, artifact access, or Apple credentials block the install, classify the blocker in this task's notes and artifact template.
