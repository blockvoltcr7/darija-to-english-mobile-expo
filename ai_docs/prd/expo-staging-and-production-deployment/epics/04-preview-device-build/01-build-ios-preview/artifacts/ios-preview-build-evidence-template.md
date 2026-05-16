# iOS Preview Build Evidence Template

Fill during execution. Do not pre-fill with speculative results.

## Build Context

- Timestamp: `2026-05-16T15:23:00Z`
- Executor: Codex parent session
- EAS account: `blockvoltcr7`
- EAS project ID: `70c597ff-6021-4069-bb43-9c301ac4baa2`
- Build profile: `preview`
- EAS environment: `preview`
- EAS channel: `preview`
- iOS bundle ID: `com.samisabiridrissi.darijatoenglish`
- Apple team ID: `57JWLP426D`
- API URL evidence: preview EAS env returned a non-local HTTPS Cloud Run URL
- Clerk publishable key presence confirmed: yes, value not copied

## Commands

- `npx eas-cli@latest whoami`: passed as `blockvoltcr7`
- `npx eas-cli@latest config --profile preview --platform ios --non-interactive`: passed; loaded `EXPO_PUBLIC_API_BASE_URL` and `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` from preview env
- `npx eas-cli@latest env:list --environment preview --format long`: not used because output can include values; `env:get` was used with Clerk value redirected/redacted
- `npx eas-cli@latest build -p ios --profile preview --non-interactive`: blocked during credentials setup

## Result

- Build status: blocked before build creation
- EAS build ID: none
- EAS build URL: none
- Artifact type: none
- Install URL captured privately: no
- Development-profile fallback used: no
- Fallback reason: not attempted; primary blocker is missing suitable iOS internal-distribution credentials for non-interactive build

## Blockers

- EAS auth: passed
- Apple credentials: blocked; EAS CLI reported no suitable credentials for internal distribution in non-interactive mode
- Device registration: unknown; credential setup must be completed first
- Dependency/version drift: `npx expo-doctor` still reports Expo SDK patch-version drift
- Other: EAS CLI warned that `ios.infoPlist.ITSAppUsesNonExemptEncryption` is missing and must be handled before App Store Connect testing

## Redaction Check

- [x] No secret values
- [x] No Clerk session tokens
- [x] No `.env` contents
- [x] No private Apple account details
- [x] No public install link pasted into public-ready docs
