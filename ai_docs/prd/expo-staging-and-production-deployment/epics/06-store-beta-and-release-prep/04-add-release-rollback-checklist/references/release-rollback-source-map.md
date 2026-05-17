# Release Rollback Source Map

Use this source map when implementing `ai_docs/deployment/release-checklist.md`.

## Repo Sources

| Source | Use in checklist |
| --- | --- |
| `ai_docs/deployment/README.md` | App identity, EAS build lanes, channel mapping, runtime boundary, and mobile-safe env boundary. |
| `ai_docs/deployment/api-hosting.md` | Staging Cloud Run service, health check, logs, revision listing, and traffic rollback command shape. |
| `ai_docs/deployment/triggerdev.md` | Trigger.dev Development runtime, production deploy command placeholder, env variable names, verification, and troubleshooting. |
| `ai_docs/prd/expo-staging-and-production-deployment/07-risk-assessment.md` | Release risks that must remain visible: localhost API target, secret leakage, disconnected Trigger worker, request-size limits, shared staging/production resources. |
| `ai_docs/prd/expo-staging-and-production-deployment/08-definition-of-done.md` | Release gate inputs: staging QA evidence, production API path, Trigger production path, runbooks, and verification commands. |
| `ai_docs/prd/expo-staging-and-production-deployment/epics/05-staging-e2e-qa/05-capture-staging-qa-evidence/artifacts/staging-e2e-qa-evidence.md` | Sanitized staging E2E evidence anchor. Do not duplicate private screenshots, transcripts, tokens, or audio contents. |
| `eas.json` | Build profiles and channels: `development`, `preview`, `staging`, `production`. Current `staging` build profile uses EAS `preview` environment. |
| `app.json` | EAS Update project URL, `runtimeVersion` policy, owner, project ID, iOS bundle ID, Android package, and Expo app version. |
| `trigger.config.mjs` | Trigger project fallback, task directory, retry policy, and max duration. |
| `package.json` | Local API, Trigger development, Trigger production deploy, typecheck, and lint scripts. |

## Official Docs To Reference

| Doc | Checklist relevance |
| --- | --- |
| Expo Rollbacks: `https://docs.expo.dev/eas-update/rollbacks/` | EAS Update supports rollback to a previous update or to the embedded update with `eas update:rollback`. |
| Expo Using EAS Update: `https://docs.expo.dev/build/updates/` | EAS Build profiles can set channels, and updates require binary-compatible runtime versions. |
| Expo Runtime Versions: `https://docs.expo.dev/eas-update/runtime-versions/` | Runtime version controls update compatibility; native changes require a new compatible build/update strategy. |
| Expo Deploy Updates: `https://docs.expo.dev/eas-update/deployment/` | Channels, branches, runtime versions, rollouts, and branch mapping are the deployment bookkeeping layer. |
| Trigger.dev Deployment: `https://trigger.dev/docs/deployment/overview` | Trigger deploys create per-environment versions; current version controls new task runs, while started runs stay locked to their original version. |
| Trigger.dev Rollback Deployments: `https://trigger.dev/changelog/rollback-deployments` | Dashboard rollback sets a previous deployment as current for new runs; already-started runs continue on the version they started with. |

## Current Config Facts

- `app.json` uses `runtimeVersion.policy = appVersion`, so the current runtime is tied to the Expo app version.
- `app.json` configures EAS Update with project URL `https://u.expo.dev/70c597ff-6021-4069-bb43-9c301ac4baa2`.
- `eas.json` maps `staging` builds to channel `staging` but EAS environment `preview`.
- Production EAS build uses channel `production` and EAS environment `production`.
- Trigger.dev Staging and Preview remain deferred in the local runbook because paid account support is not in the current scope.
- The verified staging E2E evidence used a physical iPhone preview build, Cloud Run API target, and local Trigger.dev Development worker.
