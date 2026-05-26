# Source Anchors

- `ai_docs/prd/app-store-release-readiness/11-definition-of-done.md`: production smoke-test and sanitized evidence gates.
- `ai_docs/deployment/release-checklist.md`: release preflight, runtime verification, rollback, and evidence rules.
- `ai_docs/deployment/triggerdev.md`: correlation IDs and no-local-worker troubleshooting.
- `ai_docs/deployment/production-api.md`: production URL and Trigger dependency gates.
- `server/index.mjs`: `/health`, `/health/supabase`, authenticated submit, polling, and artifact playback routes.
- `lib/api.ts`: authenticated submit, polling timeout, token refresh, and text-ready behavior.
- `app/translate.tsx`: health check, upload/recording flow, diagnostics, and visible result fields.
- `app/history.tsx`: history verification path for completed production jobs.
