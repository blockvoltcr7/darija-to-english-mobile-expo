# Epic 01: Convex Foundation And Clerk Auth

## Objective

Add Convex to the project and prove Clerk-authenticated mobile and server code can resolve identity without exposing provider secrets.

## Scope

- Install Convex dependencies.
- Generate Convex API files.
- Configure Clerk JWT validation.
- Wire Expo with `ConvexProviderWithClerk`.
- Add Convex health visibility.

## Out Of Scope

- Porting translation persistence.
- Moving file storage.
- Removing Supabase.

## Tasks

| # | Task | Type | Depends On |
| --- | --- | --- | --- |
| 01 | `install-convex-and-generate-api` | Code | Epic 00 |
| 02 | `configure-clerk-jwt-auth` | Code | `install-convex-and-generate-api` |
| 03 | `wrap-expo-with-convex-provider` | Code | `configure-clerk-jwt-auth` |
| 04 | `add-convex-health-check` | Code | `configure-clerk-jwt-auth` |

## Verification

- `npx convex dev` succeeds.
- An authenticated Convex function can resolve Clerk identity.
- Mobile public env only contains public Clerk and Convex values.

