# iOS Preview Build Evidence Template

Fill during execution. Do not pre-fill with speculative results.

## Build Context

- Timestamp:
- Executor:
- EAS account:
- EAS project ID:
- Build profile:
- EAS environment:
- EAS channel:
- iOS bundle ID:
- Apple team ID:
- API URL evidence:
- Clerk publishable key presence confirmed: yes/no, value not copied

## Commands

- `npx eas-cli@latest whoami`:
- `npx eas-cli@latest config --profile preview --platform ios --non-interactive`:
- `npx eas-cli@latest env:list --environment preview --format long`:
- `npx eas-cli@latest build -p ios --profile preview`:

## Result

- Build status:
- EAS build ID:
- EAS build URL: private reference only
- Artifact type:
- Install URL captured privately: yes/no
- Development-profile fallback used: yes/no
- Fallback reason:

## Blockers

- EAS auth:
- Apple credentials:
- Device registration:
- Dependency/version drift:
- Other:

## Redaction Check

- [ ] No secret values
- [ ] No Clerk session tokens
- [ ] No `.env` contents
- [ ] No private Apple account details
- [ ] No public install link pasted into public-ready docs
