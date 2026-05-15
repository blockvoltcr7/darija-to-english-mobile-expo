# iOS Preview Build Runbook

Run from the repo root.

## Preflight

```bash
npx eas-cli@latest whoami
npx eas-cli@latest config --profile preview --platform ios --non-interactive
npx eas-cli@latest env:list --environment preview --format long
```

If `whoami` or `config` fails, record whether the blocker is missing EAS login or missing `EXPO_TOKEN`.

## Local Config Check

```bash
node - <<'NODE'
const eas = require('./eas.json');
const app = require('./app.json').expo;
const preview = eas.build.preview;
console.log(JSON.stringify({
  distribution: preview.distribution,
  environment: preview.environment,
  channel: preview.channel,
  iosBundleIdentifier: app.ios.bundleIdentifier,
  appleTeamId: app.ios.appleTeamId,
  owner: app.owner,
  projectId: app.extra.eas.projectId
}, null, 2));
NODE
```

## Build

```bash
npx eas-cli@latest build -p ios --profile preview
```

Fallback only when explicitly needed:

```bash
npx eas-cli@latest build -p ios --profile development
```

## Redaction

- Do not print Clerk publishable-key values, API secrets, provider secrets, `.env` values, Apple account-private pages, or EAS tokens.
- Internal build URLs can install artifacts; keep them in private evidence only.
