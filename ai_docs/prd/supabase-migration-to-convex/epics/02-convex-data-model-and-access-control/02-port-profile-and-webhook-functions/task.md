# Task 02: Port Profile And Webhook Functions

## Type

Code

## Context

Supabase currently stores Clerk profile sync and webhook idempotency state. Convex needs equivalent behavior without relying on Supabase Auth.

## Implementation

- Implement a profile upsert mutation keyed by Clerk user ID.
- Implement webhook event dedupe by event ID.
- Preserve soft-delete or deleted-user behavior.
- Keep webhook payload storage sanitized.
- Add server or HTTP action entrypoints only if needed by Clerk webhook delivery.

## Acceptance Criteria

- Profile sync is idempotent.
- Duplicate webhook events do not create duplicate state changes.
- Deleted users are marked safely.
- No user-editable metadata is used for authorization.

## Dependencies

- `define-convex-schema`

## Validation Commands

```bash
npx convex dev
npm run typecheck
```

## Artifact Slots

- `artifacts/`: webhook idempotency test notes.
- `references/`: Clerk webhook source route excerpts.

