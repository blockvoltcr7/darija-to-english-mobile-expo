# Encryption Tablet And OTA Source Anchors

Use these anchors when producing the encryption/tablet/OTA decision artifact.

## Local Source Anchors

| Source | Why it matters |
| --- | --- |
| `app.json` | `ios.infoPlist.ITSAppUsesNonExemptEncryption=false`, `ios.supportsTablet=true`, `runtimeVersion.policy=appVersion`, and `updates.url`. |
| `eas.json` | Production build uses `channel=production`; staging/preview channels define non-production update lanes. |
| `package.json` | `expo-updates`, `expo-audio`, `expo-document-picker`, `expo-secure-store`, Clerk, and related package versions. |
| `ai_docs/prd/app-store-release-readiness/06-technical-specifications.md` | Native release contract and EAS Update production policy source. |
| `ai_docs/prd/app-store-release-readiness/08-ios-submission-evaluator-report.md` | Evaluator guidance for permission copy, privacy manifest warnings, encryption, iPad, and OTA policy. |
| `ai_docs/prd/app-store-release-readiness/10-risk-assessment.md` | Risks for OTA behavior, generic microphone copy, tablet quality, and privacy manifest drift. |
| `ai_docs/deployment/release-checklist.md` | Rollback rules and no-go rule against relying on EAS Update for native/runtime/config changes. |

## Official Documentation Anchors

| Source | Use |
| --- | --- |
| https://developer.apple.com/help/app-store-connect/manage-app-information/overview-of-export-compliance/ | Export-compliance decision context for apps using encryption. |
| https://developer.apple.com/documentation/BundleResources/Information-Property-List/ITSAppUsesNonExemptEncryption | Meaning of the `ITSAppUsesNonExemptEncryption` Info.plist key. |
| https://developer.apple.com/app-store/app-privacy-details/ | Privacy manifest/privacy-label context and third-party data practice responsibility. |
| https://docs.expo.dev/eas-update/deployment/ | EAS Update channels and deployment model. |
| https://docs.expo.dev/eas-update/runtime-versions/ | Runtime-version compatibility and native-code update implications. |

## Decision Boundary

This task records engineering assumptions and release-owner decisions. It is not legal advice about export compliance.
