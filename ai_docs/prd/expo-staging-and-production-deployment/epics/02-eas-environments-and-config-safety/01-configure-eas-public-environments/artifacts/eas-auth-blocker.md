# EAS Auth Blocker

Timestamp: `2026-05-14T03:59:45Z`

## Blocker

Remote EAS environment configuration could not be completed from this shell because the EAS CLI is not authenticated and no `EXPO_TOKEN` is available in the process environment.

Sanitized command results:

```text
npx eas-cli@latest whoami
=> Not logged in

EXPO_TOKEN
=> missing
```

## Intended Public Values

Set only mobile-safe public values in EAS:

- `EXPO_PUBLIC_API_BASE_URL`
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`

Do not set server-owned provider or service-role secrets in Expo public env.

The current mobile code only reads:

- `EXPO_PUBLIC_API_BASE_URL`
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`

The staging API URL from the API hosting runbook is:

```text
https://darija-api-staging-nwjxqrn2ra-uc.a.run.app
```

## Unblock Steps

Authenticate EAS in this repo, then rerun this epic:

```bash
npx eas-cli@latest login
npx eas-cli@latest whoami
```

For non-interactive execution, provide `EXPO_TOKEN` in the shell environment before rerunning.
