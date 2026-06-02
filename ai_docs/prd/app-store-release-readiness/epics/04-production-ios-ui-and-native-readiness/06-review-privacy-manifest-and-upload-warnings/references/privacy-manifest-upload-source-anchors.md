# Privacy Manifest Upload Source Anchors

## Local Anchors

| Source | Why it matters |
| --- | --- |
| `app.json` | iOS Info.plist, tablet support, `expo-audio` config, `runtimeVersion`, `updates.url`, and plugin list. |
| `eas.json` | Production/staging build channels and submit config. |
| `package.json` | Expo SDK 55 packages and native-capable dependencies that can affect privacy/upload warnings. |
| `ai_docs/deployment/release-checklist.md` | Project release checks and no-go guidance. |
| `ai_docs/prd/app-store-release-readiness/12-app-store-privacy-data-inventory.md` | Data categories and third-party processor inventory for App Store privacy labels. |

## PRD And Cross-Epic Anchors

| Source | Why it matters |
| --- | --- |
| `ai_docs/prd/app-store-release-readiness/08-ios-submission-evaluator-report.md` | Requires privacy manifest/upload warning review and native boundary discipline. |
| `ai_docs/prd/app-store-release-readiness/11-definition-of-done.md` | Requires privacy manifest aligned with disclosures and final warnings captured. |
| `ai_docs/prd/app-store-release-readiness/epics/00-submission-baseline-and-app-store-inventory/04-confirm-encryption-tablet-and-ota-policy/task.md` | Owns export-compliance/tablet/OTA policy decision record. |
| `ai_docs/prd/app-store-release-readiness/epics/05-app-store-submission-package-and-testflight-evidence/05-build-and-submit-production-ios-to-testflight/task.md` | Downstream build/submit task that needs warning review output. |

## Official Documentation Anchors

| Source | Use |
| --- | --- |
| https://developer.apple.com/documentation/bundleresources/adding-a-privacy-manifest-to-your-app-or-third-party-sdk | Apple privacy manifest and invalid manifest upload-warning context. |
| https://developer.apple.com/documentation/bundleresources/describing-use-of-required-reason-api | Required-reason API reminder/warning context. |
| https://developer.apple.com/help/app-store-connect/reference/app-information/app-privacy | App privacy URL and collected data type context. |
| https://docs.expo.dev/versions/latest/sdk/audio/ | `expo-audio` config plugin and microphone permission configuration. |
| https://docs.expo.dev/eas-update/runtime-versions/ | Native runtime/update compatibility cautions. |

## Native Boundary

Prefer `app.json`, Expo config plugin configuration, or a small reviewed config plugin for native config blockers. Do not edit generated native files as the first move unless the repo has intentionally adopted that workflow.
