# Supabase MCP Verification - Clerk Webhook Events

Task: `create-clerk-webhook-events-migration`

Target project:

- Supabase MCP project id: `npjsersrmvltoxmqdkzd`
- Bound Supabase MCP connection was used for DDL because the project-id app MCP calls returned `MCP error -32600`.

Applied migration:

- MCP migration name: `create_clerk_webhook_events`
- Recorded remote migration version: `20260510041949`
- Committed migration file: `supabase/migrations/20260510041800_create_clerk_webhook_events.sql`

Live table verification:

- `public.clerk_webhook_events` exists.
- RLS is enabled.
- Row count at creation: `0`.
- Columns:
  - `id uuid default gen_random_uuid() primary key`
  - `event_id text not null unique`
  - `event_type text not null`
  - `clerk_user_id text`
  - `payload jsonb not null`
  - `received_at timestamptz not null default now()`
  - `processed_at timestamptz`
- Indexes:
  - `clerk_webhook_events_pkey`
  - `clerk_webhook_events_event_id_key`
  - `clerk_webhook_events_clerk_user_id_idx`
  - `clerk_webhook_events_received_at_idx`
- Policies:
  - none, intentionally server-owned under the current server-mediated access model.
- Grants:
  - no `anon` or `authenticated` table grants were returned.
  - `service_role` has table privileges.

Advisor notes:

- Expected info lint: `public.clerk_webhook_events` has RLS enabled with no policies.
- Existing expected info lint: `public.profiles` has RLS enabled with no policies.
- Existing unrelated warnings remain for `public.rls_auto_enable()` security-definer executability.

Documentation checked:

- Supabase RLS docs: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase API hardening docs: https://supabase.com/docs/guides/api/securing-your-api
