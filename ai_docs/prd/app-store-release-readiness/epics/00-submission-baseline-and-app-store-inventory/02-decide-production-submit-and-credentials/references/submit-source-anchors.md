# Production Submit Source Anchors

Use these anchors when documenting the production iOS submit decision.

## Local Source Anchors

| Source | Why it matters |
| --- | --- |
| `eas.json` | Source of current submit profiles. At enrichment time, staging had `submit.staging.ios.ascAppId` and production was empty. Recheck before editing. |
| `app.json` | Source of `ios.bundleIdentifier`, `ios.appleTeamId`, EAS project ID, and app version. |
| `ai_docs/deployment/release-checklist.md` | Existing store-beta command sequence, safe evidence rules, and human-owned Apple account actions. |
| `ai_docs/deployment/testflight-qa-log.md` | Historical App Store Connect app ID and TestFlight submission IDs. Treat as historical until reverified. |
| `ai_docs/prd/app-store-release-readiness/04-gap-analysis.md` | PRD gap: production submit config empty. |
| `ai_docs/prd/app-store-release-readiness/08-ios-submission-evaluator-report.md` | Evaluator requirement: production `ascAppId` or credential strategy gate. |
| `ai_docs/prd/app-store-release-readiness/11-definition-of-done.md` | DoD item for production submit strategy without committed Apple credentials. |

## Official Documentation Anchors

| Source | Use |
| --- | --- |
| https://docs.expo.dev/submit/introduction/ | EAS Submit role in App Store/TestFlight upload and credential strategy. |
| https://docs.expo.dev/submit/eas-json/ | Configuring submit profiles in `eas.json`. |
| https://docs.expo.dev/submit/ios/ | iOS App Store submission path and `ascAppId` configuration. |
| https://developer.apple.com/help/app-store-connect/ | App Store Connect account and app-record operations. |

## Credential Boundary

Document strategy and non-secret identifiers only. Do not store `.p8` files, Apple passwords, API private keys, issuer IDs if the owner considers them sensitive, Expo access tokens, or screenshots showing credential material.
