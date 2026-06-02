# Baseline Source Anchors

Use these anchors when writing the final Epic 00 submission baseline evidence.

## Required Epic 00 Inputs

| Input | Expected artifact |
| --- | --- |
| Task 01 app/runtime inventory | `../01-inventory-ios-config-and-runtime/artifacts/app-runtime-inventory.md` |
| Task 02 submit decision | `../02-decide-production-submit-and-credentials/artifacts/production-submit-decision.md` |
| Task 03 auth decision | `../03-inventory-clerk-auth-and-apple-sign-in/artifacts/clerk-auth-and-apple-sign-in-decision.md` |
| Task 04 encryption/tablet/OTA decision | `../04-confirm-encryption-tablet-and-ota-policy/artifacts/encryption-tablet-ota-decision.md` |

If any input is missing, stale, or not accepted by the release owner, mark the baseline blocked.

## PRD And Deployment Anchors

| Source | Why it matters |
| --- | --- |
| `ai_docs/prd/app-store-release-readiness/04-gap-analysis.md` | Release gaps that Epic 00 freezes for downstream work. |
| `ai_docs/prd/app-store-release-readiness/06-technical-specifications.md` | Release environment contract, iOS native contract, and OTA policy. |
| `ai_docs/prd/app-store-release-readiness/08-ios-submission-evaluator-report.md` | Evaluator gates for auth, production submit, native privacy, OTA, iPad, and production Trigger. |
| `ai_docs/prd/app-store-release-readiness/11-definition-of-done.md` | Release-ready checklist to map downstream implications. |
| `ai_docs/prd/app-store-release-readiness/12-app-store-privacy-data-inventory.md` | Privacy-label and third-party processing context. |
| `ai_docs/deployment/production-api.md` | Current production runtime no-go state and production API gate. |
| `ai_docs/deployment/release-checklist.md` | Safe evidence, release gates, and rollback/no-go rules. |

## Redaction Boundary

The baseline may list public identifiers, file paths, status labels, owner decisions, and safe command shapes. It must not include secrets, tokens, Apple private key material, Clerk private data, private audio details, full transcripts, generated audio bytes, or credential screenshots.
