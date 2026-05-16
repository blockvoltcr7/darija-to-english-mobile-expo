# Expected Config Matrix

## Profile And Environment

| Build path | EAS profile | EAS environment | Expected API target |
| --- | --- | --- | --- |
| iOS internal preview | `preview` | `preview` | Non-local HTTPS API URL from EAS public env |
| iOS development-client fallback | `development` | `development` | Non-local HTTPS API URL from EAS public env |
| Android internal preview | `preview` | `preview` | Non-local HTTPS API URL from EAS public env |

## UI Source Anchors

- `lib/config.ts` reads `EXPO_PUBLIC_API_BASE_URL`.
- `lib/config.ts` falls back to `http://localhost:8787` for iOS simulator and `http://10.0.2.2:8787` for Android emulator.
- `app/translate.tsx` derives API target details from `CONFIG.API_BASE_URL`.
- `app/translate.tsx` renders the API label and URL in header chips.
- `app/translate.tsx` appends the API target line into the diagnostics panel.

## Pass/Fail Rule

Pass only when the installed physical-device build shows an `https://` API URL that is not:

- `localhost`
- `127.0.0.1`
- `10.0.2.2`
- a malformed URL
- an unexpected host

## Important Limitation

The app does not currently display EAS build profile, channel, app version, or Clerk publishable-key environment. Record those from EAS build/env evidence instead.
