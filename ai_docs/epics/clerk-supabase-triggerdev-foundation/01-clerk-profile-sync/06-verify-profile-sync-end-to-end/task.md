# Task 06: Verify Profile Sync End To End

## Type

Code

## Context

Epic 01 is complete only when both profile sync paths work against the same Clerk-native Supabase profile model: lazy authenticated API upsert and signed Clerk webhook sync. The epic overview requires proof that a Clerk user can create/load a profile through the API, that Clerk lifecycle events update the same row, and that duplicate events/requests are idempotent.

This task is the QA gate for Epic 01. It records evidence, not new feature behavior, and it must use production Supabase MCP checks against project `npjsersrmvltoxmqdkzd`.

## Implementation

- Start the API with `npm run api` and confirm `/health` and `/health/supabase` are healthy without exposing secrets.
- Use a test Clerk user/session to call `POST /v1/translate-audio` or the smallest authenticated route available after implementation.
- Query live Supabase through MCP `execute_sql` with `project_id: npjsersrmvltoxmqdkzd` to confirm one `profiles` row exists for the Clerk user ID.
- Repeat the authenticated request and confirm row count remains one.
- Replay or redeliver `user.created`, `user.updated`, and `user.deleted` webhook events through the documented Clerk workflow.
- Confirm event idempotency in `clerk_webhook_events` and profile mutation behavior in `profiles`.
- Record sanitized command output and DB results in `artifacts/`.

## Acceptance Criteria

- [ ] Static checks pass: `node --check server/env.mjs`, `node --check server/db.mjs`, `node --check server/index.mjs`, `npm run typecheck`, and `npm run lint`.
- [ ] `/health` and `/health/supabase` return healthy responses without secret disclosure.
- [ ] A Clerk-authenticated API request creates or loads exactly one `profiles` row for the test Clerk user ID.
- [ ] Repeating the authenticated API request does not create duplicate profile rows.
- [ ] Webhook `user.created` and `user.updated` upsert the same profile row.
- [ ] Duplicate webhook delivery is idempotent through `clerk_webhook_events.event_id`.
- [ ] Webhook `user.deleted` sets `profiles.deleted_at`.
- [ ] Verification artifacts are sanitized and include the Supabase MCP project ID used.

## Dependencies

- Depends On: call-profile-upsert-after-clerk-verification
- Depends On: document-clerk-webhook-testing
- Blocks: 02-translation-persistence-history/create-translation-schema

## Technical Notes

- Use the completed Epic 00 verification document as the baseline: `ai_docs/epics/clerk-supabase-triggerdev-foundation/00-clerk-native-db-foundation/foundation-verification.md`.
- Use the task-local webhook testing guide from Task 05 for webhook setup and replay.
- Do not print real Clerk tokens, webhook secrets, Supabase keys, or full private user payloads in artifacts.
- If mobile code is touched during implementation, also run `npx expo-doctor`; otherwise keep the Epic 01 gate focused on server/profile sync.
- Do not mark the epic ready if only lazy API upsert or only webhook sync was tested.

## Artifact Slots

- `artifacts/`: verification command outputs, sanitized DB query results, webhook replay results, and final QA summary.
- `references/`: profile sync checklist, Epic 00 foundation verification, and webhook testing guide path.
- `resources/`: reusable authenticated curl examples, webhook replay commands, and Supabase MCP query snippets.
- `notes/`: QA notes, blockers, cleanup notes for test rows/users, and residual risks.
