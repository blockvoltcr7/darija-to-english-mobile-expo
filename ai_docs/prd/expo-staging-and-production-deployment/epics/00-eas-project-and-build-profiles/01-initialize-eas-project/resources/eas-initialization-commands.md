# EAS Initialization Commands

Run from the repo root:

```bash
pwd
git status --short
npx eas-cli@latest --version
```

Inspect current project association:

```bash
node -e "const app=require('./app.json').expo; console.log(JSON.stringify({name: app.name, slug: app.slug, extra: app.extra || null, ios: app.ios, android: app.android}, null, 2))"
```

Initialize only if no EAS association exists and Expo account access is available:

```bash
npx eas-cli@latest init
```

After the command:

```bash
git diff -- app.json app.config.js eas.json
```

## Output Handling

- Save sanitized success evidence in `artifacts/eas-project-association-evidence.md`.
- If login/account/project selection blocks the command, save the exact blocker in `artifacts/eas-init-auth-blocker.md`.
- Do not paste Expo auth tokens or provider secrets into artifacts.
