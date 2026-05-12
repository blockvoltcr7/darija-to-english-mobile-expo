# Task 01: Configure EAS Public Environments

## Type

Infrastructure

## Context

Preview, staging, and production builds must compile with the right public API URL and public Clerk key. A physical device cannot use the simulator default `http://localhost:8787`.

## Implementation

- Configure EAS environment values for preview, staging, and production.
- Set only public mobile-safe variables:
  - `EXPO_PUBLIC_API_BASE_URL`.
  - `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`.
  - `EXPO_PUBLIC_SUPABASE_URL` only if the app still needs it.
  - `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` only if the app still needs it.
- Use the staging HTTPS API URL from the API hosting epic for preview/staging.
- Document production values as pending if production API is not deployed.
- Capture sanitized EAS env list output without secret values.

## Acceptance Criteria

- Preview/staging EAS builds have a non-local HTTPS API base URL.
- Mobile public env contains only `EXPO_PUBLIC_*` values.
- Production env placeholders or final values are documented.
- Missing account/auth access is captured as a blocker.

## Dependencies

- Depends On: 00-eas-project-and-build-profiles/create-eas-build-profiles
- Depends On: 01-staging-api-hosting/verify-staging-api-health

## Technical Notes

- EAS env access may require Expo account authentication.
- Do not set server-only keys in EAS public env.
- The deployed API host, not the mobile app, owns provider secrets.

## Artifact Slots

- `artifacts/`: sanitized EAS env verification.
- `references/`: PRD env matrix and current `lib/config.ts` excerpts.
- `resources/`: EAS env commands.
- `notes/`: environment naming and account-access decisions.

