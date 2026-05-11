# Task 01: Create Translation Schema

## Type

Migration

## Context

Epic 02 turns the existing synchronous translation route into a durable history system before Epic 03 moves processing to Trigger.dev. Epic 00 established Clerk-native ownership and Epic 01 guarantees authenticated requests resolve a profile, so the translation schema must use `clerk_user_id` as the ownership key and must not depend on Supabase Auth. This task creates the database foundation for `/v1/translate-audio`, future history endpoints, and later async jobs.

## Implementation

- Add a new SQL migration under `supabase/migrations/` for `public.translation_jobs`, `public.translation_results`, and `public.provider_runs`.
- Apply and verify production schema changes only through Supabase MCP with `project_id: npjsersrmvltoxmqdkzd`; do not use the Supabase local stack for this task.
- Model `translation_jobs` as the request/job envelope: `id`, `clerk_user_id`, optional `profile_id`, status, source filename/size metadata, `trace_id`, safe error fields, timestamps, and `deleted_at`.
- Model `translation_results` as one final result per job with raw OpenAI/Darija transcripts, consolidated Arabic/Darija text, English text, response metadata, and timestamps.
- Model `provider_runs` as per-provider audit rows for OpenAI STT, Modal Darija ASR, OpenAI consolidation, and OpenAI translation, including operation, model, status, latency, metadata, and safe error fields.
- Enable RLS on all tables, revoke `anon` and `authenticated`, and grant access only to `service_role` for the current server-mediated architecture.
- Add indexes and constraints for `clerk_user_id`, `job_id`, `status`, `created_at desc`, and valid status/operation values.

## Acceptance Criteria

- [ ] Migration creates `translation_jobs`, `translation_results`, and `provider_runs` in `public`.
- [ ] No new table references `auth.users` or uses `auth.uid()`.
- [ ] Every user-owned table includes `clerk_user_id text not null`.
- [ ] RLS is enabled and only `service_role` receives table privileges.
- [ ] Status values cover `queued`, `running`, `succeeded`, `failed`, and `canceled`.
- [ ] Live verification against project `npjsersrmvltoxmqdkzd` is captured in `artifacts/`.

## Dependencies

- Depends On: `01-clerk-profile-sync/verify-profile-sync-end-to-end`
- Blocks: `create-translation-db-writers`
- Blocks: `persist-sync-translation-results`
- Blocks: `add-history-api-endpoints`

## Technical Notes

- Follow existing migration conventions in `supabase/README.md` and prior migrations such as `supabase/migrations/20260510041800_create_clerk_webhook_events.sql`.
- Reuse `public.set_updated_at()` from Epic 00 for mutable tables with `updated_at`.
- Keep `clerk_user_id` as the access-control key even if `profile_id` is included for internal joins.
- Do not store `audio_base64`, provider API keys, bearer tokens, raw request headers, or server stack traces.
- Reference visual: `ai_docs/visuals/clerk-supabase-triggerdev-foundation/02-clerk-native-supabase-erd.png`.

## Artifact Slots

- `artifacts/`: migration review, Supabase MCP apply output, schema verification output.
- `references/`: ERD path and table boundary notes.
- `resources/`: Supabase MCP SQL inspection checklist.
- `notes/`: schema decisions, rejected alternatives, live DB caveats.
