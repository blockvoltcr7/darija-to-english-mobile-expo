# Config Inventory Checklist

This checklist is for execution-time inventory. Capture only sanitized values and paths.

## Safe Local Commands

Run from the repo root.

```bash
git rev-parse HEAD
node --check server/index.mjs
npm run typecheck
npm run lint
npx expo-doctor
```

Optional source inspection commands:

```bash
node -e "const app=require('./app.json').expo; console.log(JSON.stringify({name:app.name,slug:app.slug,version:app.version,owner:app.owner,ios:app.ios,runtimeVersion:app.runtimeVersion,updates:app.updates,projectId:app.extra?.eas?.projectId}, null, 2))"
node -e "const eas=require('./eas.json'); console.log(JSON.stringify({cli:eas.cli,build:eas.build,submit:eas.submit}, null, 2))"
node -e "const pkg=require('./package.json'); console.log(JSON.stringify({name:pkg.name,version:pkg.version,scripts:pkg.scripts,expo:pkg.dependencies.expo,reactNative:pkg.dependencies['react-native']}, null, 2))"
```

Only record the non-secret output fields needed for the inventory.

## Account Or Network Checks

Use only when the release owner is present and account access is expected.

```bash
npx eas-cli@latest whoami
npx eas-cli@latest config --profile production --platform ios --non-interactive
npx eas-cli@latest build:version:get -p ios --json
```

Record profile, channel, EAS environment, bundle ID, app version/build number, and API URL class. Do not paste public key values, access tokens, credential IDs, or private account screenshots.

## Inventory Matrix Columns

| Area | Source | Confirmed value or class | Evidence type | Decision needed | Safe to document? |
| --- | --- | --- | --- | --- | --- |
| App identity | `app.json` |  | source |  | yes |
| iOS bundle/team/tablet/encryption | `app.json` |  | source |  | yes |
| Runtime/update policy | `app.json`, `eas.json` |  | source |  | yes |
| EAS build lanes | `eas.json` |  | source |  | yes |
| EAS submit lanes | `eas.json` |  | source | production strategy | yes, no credentials |
| App Store Connect app ID | `eas.json` or owner evidence |  | source/live | owner verify | yes if app ID only |
| Production API target | `ai_docs/deployment/production-api.md` |  | doc/live | production URL | yes if URL is public |
| Clerk public key class | EAS config or owner evidence |  | live | production instance | key value is not copied |

## Artifact Naming

Preferred artifact name:

```text
artifacts/app-runtime-inventory.md
```
