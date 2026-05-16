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
- Human interactive `npx eas-cli@latest build -p ios --profile preview`: installed `expo-updates`, configured EAS Update, then stopped because the build command must be rerun
- Retry `npx eas-cli@latest build -p ios --profile preview --non-interactive`: created EAS update channel/branch `preview`, then blocked during credentials setup
- Human interactive `npx eas-cli@latest build -p ios --profile preview`: created Apple distribution credentials, registered the physical iPhone for ad hoc/internal distribution, then failed in the remote `INSTALL_DEPENDENCIES` phase
- `npx eas-cli@latest build:list --platform ios --limit 1 --json`: captured failed EAS build metadata for dependency-log diagnosis
- `npx npm@10.9.3 ci --include=dev --dry-run`: passed after adding npm peer-resolution config

## Result

- Build status: failed during dependency install; local dependency config updated and ready for rerun
- EAS build ID: `3efc8b55-e708-4aee-bd9e-2254699936a3`
- EAS build URL: `https://expo.dev/accounts/blockvoltcr7/projects/darija-to-english-mobile/builds/3efc8b55-e708-4aee-bd9e-2254699936a3`
- Artifact type: none
- Install URL captured privately: no
- Development-profile fallback used: no
- Fallback reason: not attempted; primary path is still EAS internal distribution after dependency-install fix
- EAS Update configured: yes, `expo-updates` added and `updates.url` / `runtimeVersion` configured
- EAS channel/branch side effect: `preview` update channel and branch created
- Device registration: physical iPhone UDID registered through Expo's device-registration flow

## Blockers

- EAS auth: passed
- Apple credentials: passed interactively; EAS created distribution certificate/profile material
- Device registration: passed interactively for the physical iPhone
- Remote dependency install: failed because EAS/npm 10 rejected peer lock resolution around Clerk/React; fixed locally with `.npmrc` `legacy-peer-deps=true` while keeping Expo SDK React pins
- Dependency/version drift: `npx expo-doctor` still reports Expo SDK patch-version drift
- Other: `ios.infoPlist.ITSAppUsesNonExemptEncryption` is now configured as `false`

## Redaction Check

- [x] No secret values
- [x] No Clerk session tokens
- [x] No `.env` contents
- [x] No private Apple account details
- [x] No public install link pasted into public-ready docs
