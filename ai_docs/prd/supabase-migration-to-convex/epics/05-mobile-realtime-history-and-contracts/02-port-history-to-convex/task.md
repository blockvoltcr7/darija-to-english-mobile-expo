# Task 02: Port History To Convex

## Type

Code

## Context

History currently fetches through REST with Clerk bearer tokens. Convex should provide auth-scoped realtime or paginated history queries.

## Implementation

- Replace `listTranslations` REST usage with a Convex query or paginated query.
- Replace detail fetch with a Convex detail query.
- Clear state when Clerk `userId` changes.
- Preserve refresh behavior where useful.
- Keep empty, loading, error, and detail-expanded states.

## Acceptance Criteria

- Fresh user sees empty history.
- User A cannot see user B history.
- Detail rows render provider metadata and result text.
- History state resets on sign-out/sign-in.

## Dependencies

- `replace-polling-with-realtime-query`

## Validation Commands

```bash
npm run typecheck
npm run lint
npx expo-doctor
```

## Artifact Slots

- `artifacts/`: history isolation proof.
- `notes/`: pagination behavior decisions.

