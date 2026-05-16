# Android Preview Build Evidence Template

Fill during execution.

## Scope

- Android active: no
- Deferred: yes
- Deferral reason: user has not explicitly activated Android for this epic run; iOS device path remains the priority
- Next action: run Android preview build later if Android becomes active

## Build Context

- Timestamp: `2026-05-16T15:23:00Z`
- EAS account: `blockvoltcr7`
- EAS project ID: `70c597ff-6021-4069-bb43-9c301ac4baa2`
- Build profile: `preview`
- EAS environment: `preview`
- Channel: `preview`
- Android package: `com.samisabiridrissi.darijatoenglish`
- API URL evidence: preview EAS env returned a non-local HTTPS Cloud Run URL
- Clerk publishable key presence confirmed: yes, value not copied

## Commands

- `npx eas-cli@latest whoami`: passed as `blockvoltcr7`
- `npx eas-cli@latest config --profile preview --platform android --non-interactive`: passed; loaded `EXPO_PUBLIC_API_BASE_URL` and `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` from preview env
- `npx eas-cli@latest build -p android --profile preview`: not run; Android deferred
- Optional `npx eas-cli@latest build:run -p android`: not run

## Result

- Build status: deferred
- EAS build ID: none
- EAS build URL: none
- Artifact type: unknown
- Installable for internal testing: unknown

## Blockers

- EAS auth: passed
- Android credentials/keystore: not evaluated
- Artifact type: not evaluated
- Emulator/device install: not evaluated
- Other: none; deferral is scope-based

## Redaction Check

- [x] No secret values
- [x] No Clerk key values
- [x] No `.env` contents
- [x] No public install link in public-ready docs
