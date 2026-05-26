# Consent Schema And Server Anchors

## Existing Persistence Patterns

- `supabase/migrations/20260510202655_create_translation_persistence_tables.sql`: server-owned tables use `clerk_user_id` as the app ownership key, enable RLS, revoke `anon`/`authenticated`, and grant `service_role`.
- `supabase/migrations/20260521204700_create_translation_artifacts.sql`: generated audio metadata follows the same server-mediated, private-data pattern.
- `server/db.mjs`: exposes the Supabase admin client used by server repository modules.
- `server/translations.mjs`: shows repository-style validation, Supabase error wrapping, and ownership-filtered updates by `jobId` + `clerkUserId`.
- `server/index.mjs`: `requireClerkSession` derives `req.clerkAuth.userId` from Clerk; consent writes must not accept user IDs from request bodies.

## PRD Consent Contract

Required consent types from `06-technical-specifications.md`:

- `third_party_ai_audio_processing`
- `privacy_policy`
- `terms_of_use`

Suggested columns:

- `id`
- `clerk_user_id`
- `consent_type`
- `version`
- `accepted_at`
- `revoked_at`
- `source`

## Data Minimization

Consent rows should store policy/version acceptance facts only. Do not store audio bytes, filenames, transcripts, translations, generated audio object keys, provider payloads, Clerk session tokens, or IP-heavy audit payloads in this table unless a later privacy review explicitly approves it.
