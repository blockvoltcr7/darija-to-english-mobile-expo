# Add Consent Persistence

## Type

Migration

## Context

The PRD requires explicit, versioned consent before audio/transcript content is processed by third-party AI services. Consent must be persisted by Clerk user ID so the server can enforce current consent versions independently of client UI state. Existing persistence tables are server-owned, keyed by `clerk_user_id`, and accessed through the Supabase admin client; this task should extend that pattern for required consent states.

## Implementation

Add a Supabase migration such as `supabase/migrations/<timestamp>_create_user_consents.sql` following the server-owned table style in `20260510202655_create_translation_persistence_tables.sql` and `20260521204700_create_translation_artifacts.sql`. Add a server consent module, for example `server/consents.mjs`, with helpers to list current consent status and record acceptance for `privacy_policy`, `terms_of_use`, and `third_party_ai_audio_processing`. Expose authenticated consent read/accept endpoints from `server/index.mjs`; derive `clerk_user_id` only from `req.clerkAuth.userId`.

## Acceptance Criteria

- [ ] Migration creates versioned consent persistence with `clerk_user_id`, `consent_type`, `version`, `accepted_at`, optional `revoked_at`, and `source`.
- [ ] Table access remains server-mediated with RLS enabled, `anon`/`authenticated` revoked, and `service_role` granted unless a later task explicitly introduces direct client RLS.
- [ ] Server helpers can report missing/outdated consent and record acceptance for the current configured version.
- [ ] API contracts never accept `clerk_user_id` from the client and never store audio bytes, transcripts, or translations in consent rows.
- [ ] `node --check server/index.mjs`, `npm run typecheck`, and `npm run lint` pass when this task is executed.

## Dependencies

- Depends On: `publish-legal-policy-sources`
- Blocks: `gate-first-audio-submit-on-consent`
- Blocks: `update-privacy-inventory-and-release-copy`

## Technical Notes

- `server/index.mjs` sets `req.clerkAuth.userId` in `requireClerkSession`; reuse that trust boundary.
- `server/db.mjs` exposes the Supabase admin client; existing repository modules wrap Supabase errors and normalize strings before writes.
- Align the current consent version with `EXPO_PUBLIC_AI_CONSENT_VERSION` or a server equivalent; if both are used, document which value is authoritative.
- Keep consent source values explicit, starting with `ios_app`, so future web/admin paths can be distinguished.

## Artifact Slots

- `artifacts/consent-contract-validation.md`: execution-time endpoint examples and static-check results with tokens redacted.
- `references/consent-schema-and-server-anchors.md`: schema/server anchors and consent data shape.
- `resources/consent-api-contract.md`: proposed request/response and error contract for executor use.
- `notes/consent-version-decisions.md`: versioning, revocation, and source decisions.
