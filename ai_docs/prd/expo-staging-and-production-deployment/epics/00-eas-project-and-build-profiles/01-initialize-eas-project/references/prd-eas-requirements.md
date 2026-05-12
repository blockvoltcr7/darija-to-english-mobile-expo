# PRD EAS Requirements

Task 01 is justified by the deployment PRD's EAS control-plane requirement.

## Source PRD Sections

- `ai_docs/prd/expo-staging-and-production-deployment/04-architecture-plan.md`
  - EAS Build profiles are the mobile build/distribution path.
  - API deployment remains separate from Expo native builds.
  - EAS env values are later used for public mobile config.
- `ai_docs/prd/expo-staging-and-production-deployment/08-definition-of-done.md`
  - `eas.json` must exist.
  - EAS project must be initialized and associated with the Expo app.
  - Preview/staging/production public env vars are configured later.

## Task 01 Boundary

This task only establishes or documents the EAS project association. It does not create the full profile matrix, configure env vars, deploy the API, deploy Trigger.dev, or start store beta setup.
