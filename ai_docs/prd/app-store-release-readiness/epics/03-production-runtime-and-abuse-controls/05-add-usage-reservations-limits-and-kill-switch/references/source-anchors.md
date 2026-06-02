# Source Anchors

- `ai_docs/prd/app-store-release-readiness/06-technical-specifications.md`: usage and abuse controls, suggested quota response, and production env contract.
- `ai_docs/prd/app-store-release-readiness/10-risk-assessment.md`: provider cost spike and Cloud Run request-size risks.
- `server/index.mjs`: authenticated create route, payload validation, storage upload, Trigger dispatch, and route-level error handling.
- `server/translation-pipeline.mjs`: provider-run recording and final job success/failure paths.
- `server/translations.mjs`: translation job, result, provider-run persistence patterns.
- `server/env.mjs`: env parsing/validation style for adding kill-switch and limit env names.
- `supabase/migrations/20260510202655_create_translation_persistence_tables.sql`: migration style for Clerk-owned server-mediated tables.
- `supabase/README.md`: migration convention and Clerk ownership/RLS constraints.
