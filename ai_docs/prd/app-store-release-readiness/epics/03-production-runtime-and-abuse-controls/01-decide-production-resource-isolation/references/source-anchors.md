# Source Anchors

## PRD And Runbooks

- `ai_docs/prd/app-store-release-readiness/05-architecture-plan.md`: production data flow and server-mediated trust boundary.
- `ai_docs/prd/app-store-release-readiness/09-implementation-phases.md`: Phase 3 production runtime and Phase 5 usage-control sequencing.
- `ai_docs/prd/app-store-release-readiness/10-risk-assessment.md`: production queued-job, privacy-label, provider-cost, and request-size risks.
- `ai_docs/prd/app-store-release-readiness/11-definition-of-done.md`: production API, Trigger worker, provider decisions, usage controls, and smoke-test gates.
- `ai_docs/deployment/production-api.md`: current deferred production API state and human-owned pause points.
- `ai_docs/deployment/triggerdev.md`: current Development worker path and future production deployment boundary.

## Code And Config

- `.env.example`: public mobile env names versus server-only env names.
- `server/env.mjs`: server env validation and forbidden public secret-name checks.
- `trigger.config.mjs`: Trigger project/environment input and task directory.
- `eas.json`: production build profile/channel/environment.
