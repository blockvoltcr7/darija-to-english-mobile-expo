# Layout Tablet Source Anchors

## Local Anchors

| Source | Why it matters |
| --- | --- |
| `app.json` | `ios.supportsTablet=true`, `orientation=portrait`, bundle ID, Apple team ID, and native release assumptions. |
| `app/index.tsx` | Signed-out landing/auth entry for public release screenshots. |
| `app/signup.tsx` | Signup copy and form layout on small/large devices. |
| `app/translate.tsx` | Main record/upload/result UI and production diagnostics hiding. |
| `app/history.tsx` | History list/detail layout and provider-internal hiding. |
| `app/account.tsx` | Account/legal/privacy/deletion entry layout. |

## PRD And Cross-Epic Anchors

| Source | Why it matters |
| --- | --- |
| `ai_docs/prd/app-store-release-readiness/06-technical-specifications.md` | iOS native release contract requires iPad verification or intentional config change. |
| `ai_docs/prd/app-store-release-readiness/08-ios-submission-evaluator-report.md` | Says iPad screenshots/QA are required while `supportsTablet=true`. |
| `ai_docs/prd/app-store-release-readiness/11-definition-of-done.md` | Requires iPad layout verified or tablet support intentionally disabled. |
| `ai_docs/prd/app-store-release-readiness/epics/00-submission-baseline-and-app-store-inventory/04-confirm-encryption-tablet-and-ota-policy/task.md` | Owns the tablet-support decision that this task must execute against. |
| `ai_docs/prd/app-store-release-readiness/epics/05-app-store-submission-package-and-testflight-evidence/03-capture-production-screenshots/task.md` | Downstream screenshot capture depends on this layout decision/evidence. |

## Evidence Boundary

Use release-mode UI with diagnostics hidden. Prefer non-sensitive sample output or empty/idle states when screenshots could expose private text.
