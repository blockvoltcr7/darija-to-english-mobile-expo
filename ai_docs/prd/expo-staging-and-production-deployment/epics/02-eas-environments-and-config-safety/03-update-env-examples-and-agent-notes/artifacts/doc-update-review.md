# Env Docs Update Review

Timestamp: `2026-05-14T04:28:00Z`

## Updated Files

- `.env.example`
- `AGENTS.md`
- `ai_docs/deployment/README.md`
- `ai_docs/prd/expo-staging-and-production-deployment/epics/00-eas-project-and-build-profiles/02-create-eas-build-profiles/notes/profile-deviations.md`

## Review

- Local simulator, Android emulator, physical-device LAN, EAS development, EAS preview/staging, and future production API targets are documented.
- Server-only values are labeled as API/host configuration and not Expo public env.
- Docs reflect the current EAS default-environment mapping:
  - `development` for EAS development-client builds.
  - `preview` for EAS preview builds.
  - `preview` for the staging profile until the Expo account supports custom environments.
  - `production` pending a production API URL.
- Docs remain consistent with `lib/config.ts`, which defaults to local simulator/emulator URLs when `EXPO_PUBLIC_API_BASE_URL` is absent.
