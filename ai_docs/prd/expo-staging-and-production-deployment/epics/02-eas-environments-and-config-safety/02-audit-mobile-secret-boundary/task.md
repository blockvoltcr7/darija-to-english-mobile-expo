# Task 02: Audit Mobile Secret Boundary

## Type

Infrastructure

## Context

The largest deployment risk is leaking paid-provider or service-role credentials into the mobile app bundle. This audit verifies that Expo public env only includes safe client values.

## Implementation

- Inspect EAS env configuration and local examples.
- Confirm these values are absent from Expo public env:
  - `OPENAI_API_KEY`
  - `DARIJA_ASR_API_KEY`
  - `CLERK_SECRET_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `TRIGGER_SECRET_KEY`
  - Modal secrets or bearer tokens
- Search app code for direct provider calls or server-only secret usage.
- Record findings in a sanitized artifact.
- If unsafe values are found, remove them before any preview build proceeds.

## Acceptance Criteria

- No server secrets are configured as Expo public env values.
- Mobile app code does not call OpenAI, Modal, or Trigger provider APIs directly.
- Audit output is saved without revealing secret values.
- Any violation is fixed or blocks preview build work.

## Dependencies

- Depends On: configure-eas-public-environments

## Technical Notes

- It is acceptable for the mobile app to send Clerk session tokens to the API.
- Supabase service role key must remain server-only.
- Avoid printing `.env.local`.

## Artifact Slots

- `artifacts/`: sanitized secret-boundary audit.
- `references/`: source snippets proving server-owned provider calls.
- `resources/`: grep/audit commands.
- `notes/`: violations, fixes, or residual risks.

