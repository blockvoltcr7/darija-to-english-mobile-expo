# Operations Source Map

## Docs To Align

- `ai_docs/deployment/api-hosting.md`: Cloud Run staging API URL, env vars, health checks, logs, and rollback.
- `ai_docs/prd/expo-staging-and-production-deployment/04-architecture-plan.md`: API, EAS, and Trigger runtime separation.
- `ai_docs/prd/expo-staging-and-production-deployment/05-technical-specifications.md`: API and Trigger runtime contracts.
- `ai_docs/prd/expo-staging-and-production-deployment/08-definition-of-done.md`: runbook and staging success gates.

## Source Files To Cite

- `trigger.config.mjs`
- `trigger/translate-audio-job.mjs`
- `server/index.mjs`
- `server/translation-pipeline.mjs`
- `server/translations.mjs`
- `lib/api.ts`
- `app/translate.tsx`

## Existing Agent Guidance

- `trigger/AGENTS.md`: stable task id and Trigger log requirements.
- `server/AGENTS.md`: async API flow and fresh-user E2E log expectations.
- `lib/AGENTS.md`: client preserves `triggerRunId` through diagnostics.
- `app/AGENTS.md`: UI diagnostics should show queued job ID, Trigger run ID, polling status, and final UI state.
