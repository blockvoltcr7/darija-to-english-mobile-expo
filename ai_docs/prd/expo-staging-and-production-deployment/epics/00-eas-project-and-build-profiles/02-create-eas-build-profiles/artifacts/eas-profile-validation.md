# EAS Profile Validation

## Created File

Root `eas.json` now defines:

- `cli.version`: `>= 16.0.1`
- `cli.appVersionSource`: `remote`
- `build.development`
- `build.preview`
- `build.staging`
- `build.production`
- `submit.staging`
- `submit.production`

## Static JSON Validation

Command:

```bash
node -e "JSON.parse(require('fs').readFileSync('eas.json','utf8')); console.log('eas.json valid JSON')"
```

Result:

```text
eas.json valid JSON
```

## Profile Inventory

Command:

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
console.log(JSON.stringify({cli: eas.cli, submit: Object.keys(eas.submit || {}), stagingEnvironment: eas.build.staging.environment}, null, 2));
NODE
```

Result:

```text
development
preview
staging
production
{
  "cli": {
    "version": ">= 16.0.1",
    "appVersionSource": "remote"
  },
  "submit": [
    "staging",
    "production"
  ],
  "stagingEnvironment": "staging"
}
```

## Intentional PRD Deviation

`build.staging.environment` is `staging`, not `preview`.

Reason: keep internal preview builds and store-beta staging builds in separate EAS environments so Epic 02 can configure mobile-safe public values independently.

No API URLs, OpenAI keys, Modal keys, Supabase service-role keys, Clerk secret keys, Trigger secrets, or store credentials were added to `eas.json`.
