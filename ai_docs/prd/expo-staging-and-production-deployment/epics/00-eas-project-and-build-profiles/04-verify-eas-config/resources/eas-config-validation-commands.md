# EAS Config Validation Commands

Run from the repo root after Tasks 02 and 03 are complete.

## Required Repo Checks

```bash
npm run typecheck
npm run lint
npx expo-doctor
```

## Conditional Server Check

Run only if server files, package runtime assumptions, or shared config touched by server changed:

```bash
node --check server/index.mjs
```

## `eas.json` Parse And Profile Check

```bash
node - <<'NODE'
const fs = require('fs');
const eas = JSON.parse(fs.readFileSync('eas.json', 'utf8'));
for (const profile of ['development', 'preview', 'staging', 'production']) {
  if (!eas.build?.[profile]) throw new Error(`Missing build.${profile}`);
}
for (const profile of ['staging', 'production']) {
  if (!eas.submit || !(profile in eas.submit)) throw new Error(`Missing submit.${profile}`);
}
console.log(JSON.stringify({ cli: eas.cli, profiles: Object.keys(eas.build), submit: Object.keys(eas.submit || {}) }, null, 2));
NODE
```

## EAS CLI Inspection

Use whichever commands are supported by the current EAS CLI:

```bash
npx eas-cli@latest --version
npx eas-cli@latest config
npx eas-cli@latest build:inspect --profile preview --platform ios
npx eas-cli@latest build:inspect --profile preview --platform android
```

If EAS CLI requires login, project access, Apple credentials, or remote account setup, save the blocker in `artifacts/eas-auth-account-blocker.md`.
