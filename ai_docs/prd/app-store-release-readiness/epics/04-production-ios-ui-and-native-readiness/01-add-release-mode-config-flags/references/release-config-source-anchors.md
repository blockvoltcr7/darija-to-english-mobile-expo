# Release Config Source Anchors

## Local Anchors

| Source | Why it matters |
| --- | --- |
| `lib/config.ts` | Current mobile config source; only exposes `CONFIG.API_BASE_URL` and simulator/emulator API fallbacks. |
| `app/translate.tsx` | Needs release flags for API chips, diagnostics, raw transcripts, and model metadata. |
| `app/history.tsx` | Needs release flags for model strings and provider operation rows. |
| `app/signup.tsx` | Needs legal URLs and consent/version copy alignment. |
| `app/account.tsx` | Needs legal/privacy/delete-account URLs once Epic 01/Epic 02 surfaces land. |
| `app.json` | Native app config, `runtimeVersion.policy=appVersion`, `updates.url`, and microphone permission plugin. |
| `eas.json` | Build profiles map `development`, `preview`, `staging`, and `production` to EAS environments/channels. |
| `ai_docs/prd/app-store-release-readiness/06-technical-specifications.md` | Source for suggested public env names and server-only secret boundaries. |
| `ai_docs/prd/app-store-release-readiness/11-definition-of-done.md` | Requires diagnostics hidden by default and EAS Update policy documented. |

## Official Documentation Anchors

| Source | Use |
| --- | --- |
| https://docs.expo.dev/eas/environment-variables/ | EAS environments, visibility classes, and public client-side env caution. |
| https://docs.expo.dev/guides/environment-variables/ | Expo `EXPO_PUBLIC_*` environment-variable behavior. |
| https://docs.expo.dev/eas-update/deployment/ | EAS Update channels and production update targeting. |
| https://docs.expo.dev/eas-update/runtime-versions/ | Runtime version compatibility and native-runtime update cautions. |

## Config Shape To Preserve

- Keep `CONFIG.API_BASE_URL`.
- Add `CONFIG.APP_ENV`, `CONFIG.IS_PRODUCTION`, `CONFIG.ENABLE_DIAGNOSTICS`, `CONFIG.LEGAL_URLS`, `CONFIG.AI_CONSENT_VERSION`, and `CONFIG.OTA_UPDATE_POLICY_VERSION`.
- Treat every `EXPO_PUBLIC_*` value as public and bundled into the app.
