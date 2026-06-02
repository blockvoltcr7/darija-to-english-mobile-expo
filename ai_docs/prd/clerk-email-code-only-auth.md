# Clerk Email-Code-Only Authentication Task

## Goal

Disable password authentication at the Clerk instance level so the app only supports email-code sign-in.

## Current App State

- `app/login.tsx` no longer shows a password field.
- The mobile sign-in flow sends a Clerk email code and completes sign-in through `app/verify.tsx`.
- Clerk dashboard/provider settings still need to be verified so password auth cannot be used outside the app UI.

## Task

1. Use the Clerk CLI or Clerk Dashboard to inspect the Darija app auth configuration.
2. Confirm email-code sign-in is enabled for email addresses.
3. Disable password authentication for sign-in.
4. Verify a signed-out user can request an email code, enter the code, and reach `/translate`.
5. Verify the login screen has no password field in the current development build.

## Preferred CLI Path

```bash
npx clerk auth login
npx clerk apps list
npx clerk config pull
```

After inspecting the pulled config, apply the password-auth change through the supported Clerk CLI command, likely `clerk config patch`, if the auth strategy is represented there.

## Fallback Dashboard Path

1. Open Clerk Dashboard.
2. Select the Darija app.
3. Open **User & authentication**.
4. Configure email sign-in to use **Email verification code**.
5. Disable **Password**.

## Acceptance Criteria

- Password authentication is disabled in Clerk settings, not only hidden in app UI.
- Existing users can sign in with email code only.
- No Clerk session tokens, API keys, or email-code values are copied into docs.
