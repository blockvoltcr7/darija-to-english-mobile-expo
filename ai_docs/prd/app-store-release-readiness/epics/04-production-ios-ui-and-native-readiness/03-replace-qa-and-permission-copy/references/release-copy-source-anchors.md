# Release Copy Source Anchors

## Local Anchors

| Source | Why it matters |
| --- | --- |
| `app/signup.tsx` | Contains the current "fresh-user QA" subtitle and audio-processing acknowledgement. |
| `app/index.tsx` | Signed-out landing/auth entry copy should stay public-facing. |
| `app/translate.tsx` | Main workflow copy, permission-denied message, and any support/diagnostic labels. |
| `app/account.tsx` | Account, legal, privacy/data, history, and future deletion entry copy. |
| `app/history.tsx` | History/detail copy and hidden provider-operation wording. |
| `app.json` | `expo-audio.microphonePermission` becomes native `NSMicrophoneUsageDescription` copy on iOS. |

## PRD Anchors

| Source | Why it matters |
| --- | --- |
| `ai_docs/prd/app-store-release-readiness/07-ui-and-store-metadata-changes.md` | Gives target signup copy, production UI behavior, legal link expectations, and reviewer-note language. |
| `ai_docs/prd/app-store-release-readiness/08-ios-submission-evaluator-report.md` | Gives the recommended product-specific microphone permission direction and AI limitation wording. |
| `ai_docs/prd/app-store-release-readiness/12-app-store-privacy-data-inventory.md` | Defines data categories and provider-processing boundaries that copy must not contradict. |
| `ai_docs/prd/app-store-release-readiness/epics/01-legal-privacy-and-consent/05-update-privacy-inventory-and-release-copy/task.md` | Cross-epic source for final privacy inventory and release-copy consistency. |

## Official Documentation Anchors

| Source | Use |
| --- | --- |
| https://docs.expo.dev/versions/latest/sdk/audio/ | `expo-audio` config plugin and `microphonePermission` behavior. |
| https://developer.apple.com/help/app-store-connect/reference/app-information/app-privacy | Privacy Policy URL and data type expectations in App Store Connect. |

## Copy Guardrails

- Avoid QA/beta/internal wording in production copy.
- Explain audio recording/upload processing plainly.
- Say AI-generated transcripts/translations may be incomplete or imperfect.
- Do not promise provider-side deletion or zero retention unless provider configuration proves it.
