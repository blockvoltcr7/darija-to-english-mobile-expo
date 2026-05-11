-- Add durable Clerk webhook event storage for idempotent profile sync.
--
-- Live target project ref / MCP project_id: npjsersrmvltoxmqdkzd.
-- Applied through Supabase MCP per project execution rule.

begin;

create table public.clerk_webhook_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null unique,
  event_type text not null,
  clerk_user_id text,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

comment on table public.clerk_webhook_events is
  'Server-owned Clerk webhook event log for idempotency and profile sync diagnostics.';

comment on column public.clerk_webhook_events.event_id is
  'Unique Clerk webhook event ID used to prevent duplicate processing.';

comment on column public.clerk_webhook_events.clerk_user_id is
  'Clerk user ID extracted from the webhook payload when present.';

comment on column public.clerk_webhook_events.payload is
  'Sanitized storage of the received Clerk webhook payload for support and debugging.';

create index clerk_webhook_events_clerk_user_id_idx
on public.clerk_webhook_events (clerk_user_id)
where clerk_user_id is not null;

create index clerk_webhook_events_received_at_idx
on public.clerk_webhook_events (received_at desc);

alter table public.clerk_webhook_events enable row level security;

revoke all on table public.clerk_webhook_events from anon;
revoke all on table public.clerk_webhook_events from authenticated;

grant select, insert, update, delete on table public.clerk_webhook_events to service_role;

commit;
