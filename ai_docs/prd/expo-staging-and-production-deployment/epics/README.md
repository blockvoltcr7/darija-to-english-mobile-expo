# Expo Staging And Production Deployment Epics

## Source

Source mode: `PRD`

Seeded from:

- `ai_docs/prd/expo-staging-and-production-deployment/README.md`
- `ai_docs/prd/expo-staging-and-production-deployment/01-executive-summary.md`
- `ai_docs/prd/expo-staging-and-production-deployment/02-problem-statement.md`
- `ai_docs/prd/expo-staging-and-production-deployment/03-product-goals-and-success-metrics.md`
- `ai_docs/prd/expo-staging-and-production-deployment/04-architecture-plan.md`
- `ai_docs/prd/expo-staging-and-production-deployment/05-technical-specifications.md`
- `ai_docs/prd/expo-staging-and-production-deployment/06-implementation-phases.md`
- `ai_docs/prd/expo-staging-and-production-deployment/07-risk-assessment.md`
- `ai_docs/prd/expo-staging-and-production-deployment/08-definition-of-done.md`

## Objective

Move the Darija to English Expo app from local simulator development to a controlled staging and beta-release path. The mobile app should install on real devices, use a reachable HTTPS API, keep provider secrets server-side, run the Trigger.dev worker through the included Development environment for now, and complete fresh Clerk user E2E QA before store beta.

## Epics

| # | Epic | Purpose |
| --- | --- | --- |
| 00 | `eas-project-and-build-profiles` | Establish the EAS project and build profiles without changing runtime behavior. |
| 01 | `staging-api-hosting` | Select and deploy the existing Express API to a reachable HTTPS staging host. |
| 02 | `eas-environments-and-config-safety` | Configure EAS public env vars and prevent local or secret config from leaking into builds. |
| 03 | `triggerdev-development-runtime` | Run and verify the Trigger.dev worker through the included Development environment. |
| 04 | `preview-device-build` | Build and install preview app binaries on real devices. |
| 05 | `staging-e2e-qa` | Prove fresh-user auth, history isolation, audio upload, Trigger execution, and result rendering. |
| 06 | `store-beta-and-release-prep` | Prepare TestFlight / Google Play testing and production release runbooks after staging passes. |

## Dependency Graph

```text
00-eas-project-and-build-profiles ─┬─> 02-eas-environments-and-config-safety ──> 04-preview-device-build ─┐
                                   │                                                                    │
01-staging-api-hosting ────────────┴─> 03-triggerdev-development-runtime ───────────────────────────────┤
                                                                                                        v
                                                                                              05-staging-e2e-qa
                                                                                                        |
                                                                                                        v
                                                                                         06-store-beta-and-release-prep
```

## Critical Decisions Preserved

- Use EAS Build and EAS Submit for native app distribution.
- Deploy the standalone Express API separately from Expo native app builds.
- Defer Expo Router API route migration.
- Use EAS environment variables for public mobile config.
- Keep OpenAI, Modal, Clerk secret, Supabase service role, and Trigger secrets off the mobile client.
- Treat Trigger.dev as a separate runtime; use Development for this no-paid scope and document production deployment separately.
- Require fresh Clerk user staging E2E before production rollout.

## Release Safety Note

This epic package makes the app testable on real devices. Wider beta or public release should still wait for the separate usage-controls work in `ai_docs/epics/clerk-supabase-triggerdev-foundation/04-usage-controls-and-release-readiness/`.
