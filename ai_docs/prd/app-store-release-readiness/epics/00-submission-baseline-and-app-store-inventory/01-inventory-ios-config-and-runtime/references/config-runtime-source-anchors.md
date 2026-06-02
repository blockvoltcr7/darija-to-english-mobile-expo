# Config And Runtime Source Anchors

Use these anchors when producing the sanitized inventory artifact.

## Local Source Anchors

| Source | Why it matters |
| --- | --- |
| `app.json` | App identity, iOS bundle identifier, Apple Team ID, tablet support, export-compliance key, EAS project ID, runtime version policy, and update URL. |
| `eas.json` | EAS build profiles, channels, environments, auto-increment behavior, staging submit `ascAppId`, and empty production submit profile. |
| `package.json` | Expo/React Native package versions and release/verification scripts such as `qa:testflight:preflight`, `trigger:deploy:prod`, `lint`, and `typecheck`. |
| `ai_docs/deployment/README.md` | Existing app identity and EAS lane runbook. |
| `ai_docs/deployment/release-checklist.md` | Release gates, safe evidence rules, EAS lane checks, rollback policy, and human-owned account actions. |
| `ai_docs/deployment/testflight-qa-log.md` | Sanitized historical TestFlight build and App Store Connect app ID evidence. Treat as historical until reverified. |
| `ai_docs/deployment/production-api.md` | Current production API decision gate and no-go state for production EAS public env. |
| `ai_docs/prd/app-store-release-readiness/06-technical-specifications.md` | iOS native release contract and EAS production policy source. |
| `ai_docs/prd/app-store-release-readiness/09-implementation-phases.md` | Phase 0 deliverable and dependency context. |
| `ai_docs/prd/app-store-release-readiness/11-definition-of-done.md` | Release-ready checklist items that this inventory feeds. |

## Official Documentation Anchors

| Source | Use |
| --- | --- |
| https://docs.expo.dev/build/eas-json/ | EAS build profile concepts and `eas.json` build configuration. |
| https://docs.expo.dev/eas/environment-variables/ | EAS environment selection and public/private env handling context. |
| https://docs.expo.dev/eas-update/deployment/ | Channel/runtime concepts for EAS Update deployment inventory. |
| https://docs.expo.dev/eas-update/runtime-versions/ | Runtime-version compatibility and native-change implications. |

## Redaction Boundary

Do not inspect or copy `.env`, `.env.local`, EAS credentials, Apple credential files, `.p8` keys, access tokens, Clerk session tokens, API keys, private audio, full transcripts, or generated audio bytes.
