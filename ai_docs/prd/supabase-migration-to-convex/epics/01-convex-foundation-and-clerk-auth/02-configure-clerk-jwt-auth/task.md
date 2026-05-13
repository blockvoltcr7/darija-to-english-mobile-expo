# Task 02: Configure Clerk JWT Auth

## Type

Code

## Context

Convex must validate Clerk-issued identity. Supabase Auth is not the identity source; existing ownership keys are Clerk user IDs.

## Implementation

- Create `convex/auth.config.ts`.
- Configure the Clerk issuer/domain and Convex application ID.
- Add a minimal authenticated query that returns the Convex identity subject and token identifier.
- Verify the identity subject maps to the existing Clerk `user_*` ownership value.

## Acceptance Criteria

- Authenticated Convex functions can resolve identity.
- User-facing Convex functions do not accept client-supplied `clerkUserId`.
- Clerk issuer/domain requirements are documented.
- Misconfigured auth fails closed.

## Dependencies

- `install-convex-and-generate-api`

## Validation Commands

```bash
npx convex dev
npm run typecheck
```

## Artifact Slots

- `artifacts/`: identity mapping proof with no tokens.
- `notes/`: Clerk dashboard/config prerequisites.

