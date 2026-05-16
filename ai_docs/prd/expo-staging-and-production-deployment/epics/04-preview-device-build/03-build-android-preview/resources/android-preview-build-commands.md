# Android Preview Build Commands

Run from the repo root.

## Preflight

```bash
npx eas-cli@latest whoami
npx eas-cli@latest config --profile preview --platform android --non-interactive
npx eas-cli@latest env:list --environment preview --format long
```

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
  androidPackage: app.android.package,
  owner: app.owner,
  projectId: app.extra.eas.projectId
}, null, 2));
NODE
```

## Build

```bash
npx eas-cli@latest build -p android --profile preview
```

Optional install/run after a successful APK build:

```bash
npx eas-cli@latest build:run -p android
```

## Deferral

If Android is not active for this epic run, fill `artifacts/android-preview-build-evidence-template.md` with:

- deferred status
- reason
- owner
- next trigger for Android work

## Redaction

- Do not print Clerk key values, `.env` values, credentials, or public install links.
