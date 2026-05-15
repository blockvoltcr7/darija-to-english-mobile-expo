# Android Preview Build Evidence Template

Fill during execution.

## Scope

- Android active: yes/no
- Deferred: yes/no
- Deferral reason:
- Next action:

## Build Context

- Timestamp:
- EAS account:
- EAS project ID:
- Build profile:
- EAS environment:
- Channel:
- Android package:
- API URL evidence:
- Clerk publishable key presence confirmed: yes/no, value not copied

## Commands

- `npx eas-cli@latest whoami`:
- `npx eas-cli@latest config --profile preview --platform android --non-interactive`:
- `npx eas-cli@latest build -p android --profile preview`:
- Optional `npx eas-cli@latest build:run -p android`:

## Result

- Build status:
- EAS build ID:
- EAS build URL: private reference only
- Artifact type: APK/AAB/unknown
- Installable for internal testing: yes/no/unknown

## Blockers

- EAS auth:
- Android credentials/keystore:
- Artifact type:
- Emulator/device install:
- Other:

## Redaction Check

- [ ] No secret values
- [ ] No Clerk key values
- [ ] No `.env` contents
- [ ] No public install link in public-ready docs
