# Mobile Secret Boundary Audit

Timestamp: `2026-05-14T04:24:00Z`

## Result

Passed with one deferred item: production EAS public values are intentionally not configured because no production API URL exists yet.

## EAS Public Env Inventory

Default `development` environment:

- `EXPO_PUBLIC_API_BASE_URL`: public, points to the staging Cloud Run API.
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`: sensitive visibility, present and masked by EAS CLI.

Default `preview` environment:

- `EXPO_PUBLIC_API_BASE_URL`: public, points to the staging Cloud Run API.
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`: sensitive visibility, present and masked by EAS CLI.

Default `production` environment:

- No variables found. This is expected until a production API URL exists.

## Mobile Code Env Usage

Search scope: `app/` and `lib/`.

Mobile code reads:

- `EXPO_PUBLIC_API_BASE_URL` through `lib/config.ts`.
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` through `app/_layout.tsx`.

No mobile code references were found for:

- `OPENAI_API_KEY`
- `DARIJA_ASR_API_KEY`
- `DARIJA_ASR_BASE_URL`
- `DARIJA_ASR_URL`
- `CLERK_SECRET_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_SECRET_KEY`
- `TRIGGER_SECRET_KEY`

## Boundary Decision

The app may send Clerk session tokens to the API. Paid provider keys, service-role keys, and Trigger credentials remain API/worker host configuration only.
