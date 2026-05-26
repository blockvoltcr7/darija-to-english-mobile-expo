# Epic 02: Account Deletion And Data Lifecycle

## Goal

Let signed-in users initiate account deletion from inside the app and clean or anonymize app-owned data according to the documented policy.

## Scope

- Map the deletion policy to Clerk, app profile data, translation rows, provider metadata, original audio, generated artifacts, and audit evidence.
- Add Account -> Privacy/Data -> Delete Account UI.
- Add authenticated account deletion API.
- Delete or anonymize user-owned rows and private storage objects.
- Integrate Clerk deletion or scheduling.
- Verify second-user and post-deletion access denial.

## Tasks

1. `01-map-account-deletion-policy-to-data`
2. `02-add-delete-account-ui`
3. `03-add-authenticated-account-deletion-api`
4. `04-add-user-data-and-storage-cleanup`
5. `05-integrate-clerk-deletion-or-scheduling`
6. `06-verify-deletion-access-denial-and-evidence`

## Dependencies

- Depends On: `01-legal-privacy-and-consent/publish-legal-policy-sources`
- Depends On: `01-legal-privacy-and-consent/update-privacy-inventory-and-release-copy`

## Exit Criteria

- Test user can initiate deletion in app.
- Deleted user's history and playback are no longer available.
- Deletion evidence contains no private transcript/audio content.

<!-- ENRICHED-OVERVIEW-START -->
## Enriched Overview

### Scope

Epic 02 turns the App Store account-deletion requirement into an in-app, server-mediated flow. The epic starts by mapping Clerk, profile, translation, provider metadata, original audio, generated artifacts, and audit evidence to a documented deletion/anonymization policy; then it adds the mobile initiation UI, authenticated deletion API, app-owned cleanup helpers, Clerk deletion or scheduling, and sanitized verification evidence. The mobile app must keep provider secrets and deletion authority server-side, and user-facing copy must not overpromise deletion from third-party processor retention systems.

### Task Summary

| # | Slug | Type | Summary | Key Dependencies |
|---|---|---|---|---|
| 01 | `map-account-deletion-policy-to-data` | Code | Map each user data surface to delete, anonymize, retain, or audit behavior before implementation. | `01-legal-privacy-and-consent/update-privacy-inventory-and-release-copy` |
| 02 | `add-delete-account-ui` | UI | Add Account -> Privacy/Data -> Delete Account UI, typed mobile API wrapper, explicit confirmation, and safe state handling. | `map-account-deletion-policy-to-data`; `01-legal-privacy-and-consent/add-in-app-legal-surfaces`; `add-authenticated-account-deletion-api` |
| 03 | `add-authenticated-account-deletion-api` | Code | Add a Clerk-authenticated `DELETE /v1/account` contract that derives user identity server-side and returns safe deletion state metadata. | `map-account-deletion-policy-to-data` |
| 04 | `add-user-data-and-storage-cleanup` | Code | Clean or anonymize app-owned profile, translation, provider, original-audio, generated-artifact, and audit data according to policy. | `add-authenticated-account-deletion-api` |
| 05 | `integrate-clerk-deletion-or-scheduling` | Code | Delete or schedule the Clerk account after app-owned cleanup reaches the accepted policy state, while preserving webhook idempotency. | `add-user-data-and-storage-cleanup` |
| 06 | `verify-deletion-access-denial-and-evidence` | Code | Prove in-app initiation, deleted-user history/playback denial, second-user isolation, storage cleanup, and sanitized release evidence. | `integrate-clerk-deletion-or-scheduling`; `add-delete-account-ui` |

### Execution Notes

- Shared files likely touched across this epic: `app/account.tsx`, `lib/api.ts`, `lib/types.ts`, `server/index.mjs`, `server/profiles.mjs`, `server/translations.mjs`, `server/storage.mjs`, and Supabase migration files if audit/deletion metadata changes are required.
- Task `02-add-delete-account-ui` now depends on the authenticated API contract for end-to-end completion, even though UI layout can be sketched earlier. Preserve this when analyzing execution order.
- Keep deletion evidence sanitized: safe IDs/statuses are acceptable, but tokens, `.env` values, private audio bytes, full transcripts, generated audio payloads, and private object keys must stay out of artifacts.
- Unresolved implementation choices remain around typed confirmation style, immediate sign-out versus completion screen, Clerk deletion versus scheduling, and provider-retention wording. These should be closed during execution using task-local notes and Epic 01 legal-copy outputs.
<!-- ENRICHED-OVERVIEW-END -->
