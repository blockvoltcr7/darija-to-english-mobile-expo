# Release Readiness Command Checklist

Run from the repo root during task execution. Capture sanitized pass/fail summaries in the final artifact; do not paste secrets or private payloads.

## Static And Local Checks

```bash
node --check server/index.mjs
node --check trigger/translate-audio-job.mjs
npm run typecheck
npm run lint
npx expo-doctor
```

Expected result: all commands exit successfully, or each failure is classified as blocking/non-blocking with an owner and next action.

## API Health Checks

Local API, if validating local development:

```bash
npm run api
curl -sS http://localhost:8787/health
```

Staging API:

```bash
curl -sS https://darija-api-staging-nwjxqrn2ra-uc.a.run.app/health
```

Expected response includes:

- `ok: true`
- `service: "darija-to-english-api"`
- `models.openai_transcription`
- `models.consolidation`
- `models.translation`

The health endpoint verifies configuration shape only. It does not prove provider execution.

## Trigger Development Worker Check

For the current no-paid Trigger scope:

```bash
npm run trigger:dev -- --env-file .env.local --skip-update-check
```

The release report should state whether the verified path is:

- local Trigger.dev Development worker only.
- hosted staging/production Trigger deployment.
- blocked or deferred.

Do not run `npm run trigger:deploy:prod` unless the production API path, production secrets, and release lane have been explicitly approved.

## EAS And Store Beta Checks

Inspect current build profile configuration:

```bash
node -e "const eas=require('./eas.json'); console.log(JSON.stringify({staging:eas.build.staging, production:eas.build.production, submit:Object.keys(eas.submit || {})}, null, 2))"
```

During store-beta execution, capture sanitized output for the relevant lane:

```bash
npx eas-cli@latest build -p ios --profile staging
npx eas-cli@latest build -p android --profile staging
npx eas-cli@latest submit -p ios --profile staging
npx eas-cli@latest submit -p android --profile staging
```

If credentials or store app records are missing, record the blocker instead of treating the lane as passed.

## Fresh QA Evidence Refresh

Before recommending store beta or public release, re-check the latest:

```bash
sed -n '1,220p' ai_docs/prd/expo-staging-and-production-deployment/epics/05-staging-e2e-qa/05-capture-staging-qa-evidence/artifacts/staging-e2e-qa-evidence.md
sed -n '1,220p' ai_docs/prd/expo-staging-and-production-deployment/epics/04-preview-device-build/status.log
```

Treat those files as prior evidence. If release timing matters, run fresh phone QA or document why the prior evidence is still acceptable.
