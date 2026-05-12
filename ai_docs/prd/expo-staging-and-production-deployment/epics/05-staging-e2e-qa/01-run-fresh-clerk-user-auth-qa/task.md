# Task 01: Run Fresh Clerk User Auth QA

## Type

Code

## Context

Staging must prove a new Clerk user can be created and signed in from the installed preview app. This validates the public auth screens and Clerk environment wiring before translation QA.

## Implementation

- Start from the installed preview app on the physical iPhone.
- Sign out if an existing user is active.
- Create a fresh Clerk test user using the app sign-up flow.
- Complete email verification.
- Sign in as the new user.
- Open Account and verify the displayed email or identity belongs to the new test user.
- Record the test user identity in sanitized form.

## Acceptance Criteria

- Fresh user sign-up succeeds.
- Email verification succeeds.
- The app signs in as the new user.
- Account UI confirms the expected user identity.
- Any auth blocker is captured with screen, build, and environment context.

## Dependencies

- Depends On: 04-preview-device-build/verify-preview-app-diagnostics

## Technical Notes

- Use a test user, not a personal production account, where possible.
- Do not store full verification codes in long-lived docs.

## Artifact Slots

- `artifacts/`: sanitized screenshots and auth QA summary.
- `references/`: auth flow file references or Clerk environment notes.
- `resources/`: test-user checklist.
- `notes/`: auth blockers and account cleanup notes.

