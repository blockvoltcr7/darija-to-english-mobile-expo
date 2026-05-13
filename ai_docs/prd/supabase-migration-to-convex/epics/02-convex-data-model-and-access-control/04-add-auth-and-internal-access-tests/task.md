# Task 04: Add Auth And Internal Access Tests

## Type

Code

## Context

Convex does not provide Supabase-style RLS. Data isolation must be enforced in every public query and mutation.

## Implementation

- Add tests or manual validation scripts for user A/user B isolation.
- Verify public functions reject missing auth.
- Verify public functions do not accept `clerkUserId`.
- Verify worker-only mutations are not callable by the mobile app.
- Verify duplicate job public IDs and webhook event IDs are handled idempotently.

## Acceptance Criteria

- Cross-user history/detail access fails.
- Unauthenticated public functions fail closed.
- Internal/worker writes cannot be called from mobile.
- Test evidence is captured without tokens.

## Dependencies

- `port-profile-and-webhook-functions`
- `port-translation-repository-functions`

## Validation Commands

```bash
npx convex dev
npm run typecheck
npm run lint
```

## Artifact Slots

- `artifacts/`: auth isolation matrix.
- `notes/`: residual access-control risks.

