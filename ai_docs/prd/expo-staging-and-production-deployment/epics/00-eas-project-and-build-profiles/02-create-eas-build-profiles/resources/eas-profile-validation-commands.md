# EAS Profile Validation Commands

Run after `eas.json` is created.

## Static JSON Validation

```bash
node -e "JSON.parse(require('fs').readFileSync('eas.json','utf8')); console.log('eas.json valid JSON')"
```

## Profile Inventory

```bash
node - <<'NODE'
const eas = JSON.parse(require('fs').readFileSync('eas.json', 'utf8'));
const profiles = Object.keys(eas.build || {});
console.log(profiles.join('\n'));
for (const required of ['development', 'preview', 'staging', 'production']) {
  if (!profiles.includes(required)) throw new Error(`Missing build profile: ${required}`);
}
for (const required of ['staging', 'production']) {
  if (!eas.submit || !(required in eas.submit)) throw new Error(`Missing submit profile: ${required}`);
}
NODE
```

## EAS CLI Inspection

Use the safest available command for the installed EAS CLI:

```bash
npx eas-cli@latest config
npx eas-cli@latest build:inspect --profile preview --platform ios
```

If either command requires Expo login or remote account access, record the exact blocker instead of claiming validation succeeded.
