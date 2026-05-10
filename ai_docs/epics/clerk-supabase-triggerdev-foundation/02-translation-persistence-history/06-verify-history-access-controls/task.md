# Task 06: Verify History Access Controls

## Type

Code

## Context

Translation history contains user-owned transcripts and English translations. Because the current architecture is server-mediated with Clerk tokens, the decisive access-control checks live in Express route guards and `clerk_user_id` filters, not Supabase Auth policies. This task proves that unauthenticated and cross-user history access cannot expose transcript data.

## Implementation

- Start from a clean understanding of existing data in production Supabase project `npjsersrmvltoxmqdkzd` using Supabase MCP read-only queries.
- Run unauthenticated checks for `GET /v1/translations` and `GET /v1/translations/:id`; both must return `401`.
- Run authenticated checks with a real Clerk session token; list must return only rows for that token's `clerk_user_id`.
- Attempt cross-user detail access by using a known other-user job id or a temporary QA fixture row with a different `clerk_user_id`; response must be `404`.
- If temporary QA rows are created in production, use obvious test metadata, never store real audio, record created row ids, and clean them up in the same task.
- Capture curl/API evidence and Supabase MCP row-count evidence in `artifacts/`.

## Acceptance Criteria

- [ ] Unauthenticated list and detail calls return `401`.
- [ ] Authenticated list calls return only rows for the caller's `clerk_user_id`.
- [ ] Authenticated detail calls return the caller's own rows.
- [ ] Cross-user detail access returns `404` and does not reveal ownership or transcript content.
- [ ] Any production QA fixture rows are cleaned up and cleanup evidence is recorded.
- [ ] Verification artifacts avoid real secrets, bearer tokens, full emails, and sensitive transcript content.

## Dependencies

- Depends On: `add-history-api-endpoints`
- Depends On: `add-mobile-history-surface`
- Blocks: Epic 02 approval for implementation completion

## Technical Notes

- Use the same verification command set as prior epics where applicable: `node --check server/index.mjs server/translations.mjs`, `npm run typecheck`, `npm run lint`, and `npx expo-doctor` after mobile changes.
- Supabase MCP calls must target `project_id: npjsersrmvltoxmqdkzd`.
- Redact Clerk bearer tokens and transcript bodies from artifacts; use ids, counts, status codes, and short previews only.
- The DB may still show RLS enabled with no user policies by design because the service-role API server enforces ownership filters.

## Artifact Slots

- `artifacts/`: curl outputs, status-code evidence, MCP query evidence, cleanup proof.
- `references/`: access-control checklist.
- `resources/`: manual test matrix and command templates.
- `notes/`: QA findings, fixture ids, blockers, residual risk.
