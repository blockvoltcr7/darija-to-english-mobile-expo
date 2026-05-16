# EAS Public Env Verification

Timestamp: `2026-05-14T04:23:00Z`

## EAS Project

- Account: `blockvoltcr7`
- Project: `darija-to-english-mobile`
- Project ID: `70c597ff-6021-4069-bb43-9c301ac4baa2`
- Project URL: `https://expo.dev/accounts/blockvoltcr7/projects/darija-to-english-mobile`

`npx eas-cli@latest init --non-interactive --force` linked the local app to the EAS project and updated `app.json` with `expo.owner` and `expo.extra.eas.projectId`.

## Configured Public Values

The default `development` EAS environment contains:

| Name | Visibility | Value Evidence |
| --- | --- | --- |
| `EXPO_PUBLIC_API_BASE_URL` | Public | `https://darija-api-staging-nwjxqrn2ra-uc.a.run.app` |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Sensitive | Present; value intentionally not printed. |

The default `preview` EAS environment contains:

| Name | Visibility | Value Evidence |
| --- | --- | --- |
| `EXPO_PUBLIC_API_BASE_URL` | Public | `https://darija-api-staging-nwjxqrn2ra-uc.a.run.app` |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Sensitive | Present; value intentionally not printed. |

The current Expo account does not support custom `staging` EAS environments:

```text
Custom environments are supported on Production and Enterprise plans. Upgrade or use the default environments (production, preview, development).
```

Because of that platform limit, `eas.json` uses `environment: "preview"` for both `preview` and `staging` build profiles. Staging still has its own EAS build profile and channel, but it reads the same default preview environment values.

## Production Status

Production EAS environment values are not configured yet because no production API URL exists in this deployment package. Configure production values only after the production API host is created.

## Mobile Public Vars In Use

Current mobile code reads only these Expo public vars:

- `EXPO_PUBLIC_API_BASE_URL`
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`

No Supabase public variables are currently required by the mobile code.
