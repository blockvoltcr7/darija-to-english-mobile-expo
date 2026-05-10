# Task 03: Create Clerk Webhook Events Migration

## Type

Migration

## Context

Clerk lifecycle events are external to Postgres, so profile sync cannot be driven by `auth.users` triggers. The epic overview and `05-clerk-supabase-auth-solidification-plan.md` require a signed Clerk webhook path for `user.created`, `user.updated`, and `user.deleted`, with durable event storage for idempotency and support debugging.

This task adds the private Supabase table that records Clerk webhook event IDs and payload metadata. It is schema-only; the Express endpoint and signature verification belong to `add-clerk-webhook-endpoint`.

## Implementation

- Add a committed migration under `supabase/migrations/` for `public.clerk_webhook_events`.
- Apply live schema changes through Supabase MCP only, targeting `project_id: npjsersrmvltoxmqdkzd`; do not use a local Supabase stack.
- Include at minimum `id uuid primary key default gen_random_uuid()`, `event_id text not null unique`, `event_type text not null`, `clerk_user_id text`, `payload jsonb not null`, `received_at timestamptz not null default now()`, and `processed_at timestamptz`.
- Add indexes for `event_id`, `clerk_user_id`, and recent event inspection by `received_at`.
- Enable RLS and keep the table server-owned; do not grant broad `anon` or `authenticated` access.
- Add SQL comments that this table supports webhook idempotency and diagnostics, not user authorization.

## Acceptance Criteria

- [ ] `public.clerk_webhook_events` exists in the live Supabase project `npjsersrmvltoxmqdkzd`.
- [ ] `event_id` has a unique constraint or unique index that prevents duplicate event records.
- [ ] The table stores event type, Clerk user ID when present, payload JSON, received time, and processed time.
- [ ] RLS is enabled and no broad client-facing access is granted to `anon` or `authenticated`.
- [ ] The table has no foreign key to `auth.users` and no `auth.uid()` policy.
- [ ] The committed migration file matches the live schema applied through Supabase MCP.

## Dependencies

- Depends On: 00-clerk-native-db-foundation/add-db-local-updated-at-trigger
- Blocks: add-clerk-webhook-endpoint

## Technical Notes

- Use the ERD visual as reference: `ai_docs/visuals/clerk-supabase-triggerdev-foundation/02-clerk-native-supabase-erd.png`.
- Follow the project target documented in `supabase/README.md`: MCP calls must use `project_id: npjsersrmvltoxmqdkzd`.
- If a database mutation is required during execution, use Supabase MCP `execute_sql` for inspection and the approved MCP migration/apply path for production schema changes.
- Run Supabase security advisors after applying the table and document expected findings.
- Do not create webhook handler code, request parsing, or Clerk signature logic here.

## Artifact Slots

- `artifacts/`: migration review notes, Supabase MCP apply output, advisor summary, and duplicate-event verification.
- `references/`: ERD visual path, Epic 00 foundation verification, and Clerk webhook plan notes.
- `resources/`: SQL drafts, event-table verification SQL, and sanitized sample webhook payloads.
- `notes/`: idempotency decisions, RLS/grant decisions, and rollback notes.
