# Task 03: Wrap Expo With Convex Provider

## Type

Code

## Context

The richer app already wraps routes in `ClerkProvider`. Convex should be added under the Clerk boundary using `ConvexProviderWithClerk`.

## Implementation

- Instantiate `ConvexReactClient` from `EXPO_PUBLIC_CONVEX_URL`.
- Wrap the app with `ConvexProviderWithClerk` using `useAuth`.
- Preserve the existing public/protected route split.
- Preserve Clerk token cache behavior.
- Keep Clerk package versions pinned unless deliberately retested.

## Acceptance Criteria

- Existing Clerk auth routes still load.
- Signed-out users cannot access protected translation/history routes.
- Signed-in users can call a test Convex query.
- No server secrets are included in mobile env.

## Dependencies

- `configure-clerk-jwt-auth`

## Validation Commands

```bash
npm run typecheck
npm run lint
npx expo-doctor
```

## Artifact Slots

- `artifacts/`: simulator screenshot or log proving signed-in Convex query.
- `notes/`: mobile provider wiring notes.

