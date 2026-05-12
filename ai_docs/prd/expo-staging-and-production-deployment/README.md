# Expo Staging And Production Deployment PRD

## Purpose

Define the deployment path for Darija to English so the app can be installed and tested on real iOS/Android devices before public release, while keeping the server-side API, Trigger.dev worker, Supabase, Modal, OpenAI, and Clerk boundaries explicit.

This PRD is seeded from:

- `ai_docs/html-visuals/darija-expo-deployment-map.html`
- `app.json`
- `lib/config.ts`
- `server/index.mjs`
- `trigger/translate-audio-job.mjs`
- `AGENTS.md`
- `server/AGENTS.md`
- `trigger/AGENTS.md`
- `package.json`

## Recommended Reading Order

1. `01-executive-summary.md`
2. `02-problem-statement.md`
3. `03-product-goals-and-success-metrics.md`
4. `04-architecture-plan.md`
5. `05-technical-specifications.md`
6. `06-implementation-phases.md`
7. `07-risk-assessment.md`
8. `08-definition-of-done.md`

## Primary Decision

Deploy the current standalone Express API separately from the Expo mobile app. Use Expo Application Services for iOS/Android builds, internal distribution, TestFlight / Google Play testing, EAS environment variables, and later EAS Update channels.

Do not refactor the backend into Expo Router API routes in the first staging effort. That can be reconsidered later after the current Express API has a stable production host.

## Next Step

```bash
seed-epic ai_docs/prd/expo-staging-and-production-deployment
```
