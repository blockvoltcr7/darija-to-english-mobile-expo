# Configure Production Auth Storage And Providers

## Type

Infrastructure

## Context

The production API and Trigger worker are only release-ready if Clerk, Supabase Storage/Postgres, OpenAI, Modal Darija ASR, and Trigger secrets point at the approved production resources. The PRD's mobile trust boundary requires all paid-service and service-role access to remain server-side, while App Store privacy labels and account-deletion work depend on the final data/resource decisions.

## Implementation

- Build `artifacts/production-runtime-configuration-checklist.md` from `resources/configuration-checklist.md`; record variable names, owner, configured surface, and verification status only.
- Verify Clerk publishable/secret/webhook naming and webhook route `POST /v1/webhooks/clerk` in `server/index.mjs`; do not paste tokens or signing secrets.
- Verify Supabase URL/secret/buckets/migrations against `supabase/README.md`, `server/db.mjs`, `server/storage.mjs`, and existing migrations for `profiles`, `translation_jobs`, `provider_runs`, and `translation_artifacts`.
- Verify OpenAI, Modal, Trigger, TTS, upload limit, and retention env names against `.env.example`, `server/env.mjs`, `server/translation-pipeline.mjs`, and `server/tts/index.mjs`.

## Acceptance Criteria

- [ ] Production Clerk, Supabase, Trigger, OpenAI, Modal, and optional TTS configuration is documented by name/owner/status without values.
- [ ] EAS production public env contains only mobile-safe values such as `EXPO_PUBLIC_API_BASE_URL` and `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`.
- [ ] Server-only values remain in Cloud Run/Trigger/provider secret stores, not Expo public env or committed docs.
- [ ] Production API can verify a Clerk session and reach production Supabase through server-side credentials.
- [ ] Provider quota/spend owners and retention assumptions are explicit enough to support usage-control thresholds.

## Dependencies

- Depends On: `decide-production-resource-isolation`
- Depends On: `deploy-production-cloud-run-api`
- Depends On: `deploy-production-trigger-worker`
- Blocks: `add-usage-reservations-limits-and-kill-switch`
- Blocks: `run-production-smoke-test`

## Technical Notes

- `server/env.mjs` accepts `SUPABASE_SECRET_KEY` with `SUPABASE_SERVICE_ROLE_KEY` as a legacy fallback; production should prefer the documented secret name.
- Supabase remains server-mediated; current guidance says not to expose service-role or Clerk-owned table access directly to mobile.
- Clerk is the identity source; app-owned rows should continue to use `clerk_user_id` as the durable ownership key.
- If production Supabase is shared, deletion/privacy verification must explicitly cover separation and retention implications.

## Artifact Slots

- `artifacts/production-runtime-configuration-checklist.md`: sanitized configured-name/status checklist.
- `references/source-anchors.md`: env, Clerk, Supabase, provider, and storage anchors.
- `resources/configuration-checklist.md`: execution checklist.
- `notes/provider-quota-retention-decisions.md`: quota, retention, and ownership decisions.
