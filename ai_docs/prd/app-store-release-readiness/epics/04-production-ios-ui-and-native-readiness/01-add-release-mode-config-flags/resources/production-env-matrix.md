# Production Env Matrix

Use this matrix when documenting the final release config contract. Do not paste real secrets or private dashboard values.

| Name | Development | Preview/Staging | Production | Mobile-safe? | Notes |
| --- | --- | --- | --- | --- | --- |
| `EXPO_PUBLIC_API_BASE_URL` | `http://localhost:8787` for iOS simulator, `http://10.0.2.2:8787` for Android emulator | staging HTTPS API URL | production HTTPS API URL | Yes | Physical devices cannot use `localhost`. |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | development Clerk publishable key | preview/staging publishable key | production publishable key | Yes | Publishable only; never use Clerk secret in mobile config. |
| `EXPO_PUBLIC_APP_ENV` | `development` | `preview` or `staging` | `production` | Yes | Drives `CONFIG.IS_PRODUCTION`. |
| `EXPO_PUBLIC_ENABLE_DIAGNOSTICS` | `true` | `true` for QA, or explicit support mode | `false` by default | Yes | Public builds hide diagnostics unless explicitly enabled. |
| `EXPO_PUBLIC_LEGAL_PRIVACY_URL` | draft/dev URL if available | hosted preview URL | production privacy URL | Yes | Must be public before final submission. |
| `EXPO_PUBLIC_LEGAL_TERMS_URL` | draft/dev URL if available | hosted preview URL | production terms URL | Yes | Must match legal copy in Epic 01. |
| `EXPO_PUBLIC_LEGAL_DELETE_ACCOUNT_URL` | draft/dev URL if available | hosted preview URL | production deletion URL | Yes | Complements in-app deletion from Epic 02. |
| `EXPO_PUBLIC_AI_CONSENT_VERSION` | current draft version | preview release version | production consent version | Yes | Use stable date or semver-style value. |
| `EXPO_PUBLIC_OTA_UPDATE_POLICY_VERSION` | current draft version | preview release version | production policy version | Yes | Must match baseline/Epic 00 decision record. |

Server-only values that must not be in mobile config or docs:

- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SIGNING_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SECRET_KEY`
- `OPENAI_API_KEY`
- `DARIJA_ASR_API_KEY`
- `TRIGGER_SECRET_KEY`
- Apple `.p8` keys, App Store Connect API private keys, session tokens, and `.env` contents
