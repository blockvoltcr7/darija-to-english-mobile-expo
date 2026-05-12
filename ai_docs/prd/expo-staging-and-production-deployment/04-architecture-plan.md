# 04 — Architecture Plan

## Deployment Data Flow

```text
Developer / CI
  |
  |-- EAS Build profiles
  |     |-- development build
  |     |-- preview internal build
  |     |-- staging TestFlight / Google Play test build
  |     `-- production App Store / Play Store build
  |
  |-- API deployment
  |     `-- HTTPS Node/Express host running server/index.mjs
  |
  |-- Trigger.dev deployment
  |     `-- translate-audio-job worker environment
  |
  `-- EAS env values
        `-- EXPO_PUBLIC_API_BASE_URL=https://<environment-api>

Installed mobile app
  |
  |-- Clerk signs user in
  |-- lib/api.ts sends Authorization: Bearer <Clerk token>
  |-- POST /v1/translations to HTTPS API
  |-- API stores audio/job in Supabase and dispatches Trigger.dev
  |-- Trigger worker runs OpenAI STT + Modal ASR + consolidation + translation
  `-- Mobile polls GET /v1/translations/:id until succeeded/failed
```

## New Files

| File | Purpose |
| --- | --- |
| `eas.json` | Defines EAS build, submit, channel, and environment behavior for development, preview, staging, and production. |
| `ai_docs/deployment/README.md` | Human runbook for deployment architecture, environment setup, and release flow. |
| `ai_docs/deployment/staging-qa.md` | Step-by-step staging phone QA checklist. |
| `ai_docs/deployment/api-hosting.md` | Documents chosen API host, env vars, health checks, logs, and rollback. |
| Optional `.eas/workflows/*.yml` | Later automation for CI-triggered builds or submissions. |

## Modified Files

| File | Change |
| --- | --- |
| `package.json` | Add scripts only if useful wrappers are needed for EAS build/submit/deploy commands. |
| `.env.example` | Document staging/production API URL examples without secrets. |
| `AGENTS.md` | Add staging/production deployment and QA notes. |
| `ai_docs/html-visuals/README.md` | Already includes the deployment map; keep it linked as reference material. |
| `lib/config.ts` | Keep current behavior, but consider a warning or test assertion that non-local builds cannot silently use localhost. |

## Key Design Decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| API hosting shape | Deploy existing Express API separately. | Lowest-risk path; matches current `@clerk/express`, Supabase, Trigger dispatch, and server-owned secrets. |
| Expo API routes | Defer. | Refactor would require moving route logic into `+api.ts` and validating runtime compatibility. |
| Phone beta path | Use EAS internal distribution first, then TestFlight / Google Play testing. | Internal distribution is fastest for owner-device QA; store beta is closer to production. |
| Config source | Use EAS environment variables for `EXPO_PUBLIC_API_BASE_URL`. | Prevents hardcoding staging/prod URLs into source code. |
| Secrets | Keep provider and service-role secrets only on API/Trigger hosts. | Mobile clients are not trusted secret stores. |

## Candidate API Hosts

This PRD does not require choosing the final host before epics are generated. The implementation epic should include one decision task to select the host.

Acceptable host requirements:

- Supports Node 20+ or current project runtime.
- Supports Express or HTTP server entrypoint.
- Supports persistent environment secrets.
- Provides HTTPS.
- Provides logs and deployment rollback.
- Allows outbound calls to Clerk, Supabase, Trigger.dev, Modal, and OpenAI.
- Can handle request body sizes required by current audio uploads or supports an upload-to-storage alternative.

Likely options:

- Render
- Fly.io
- Railway
- Google Cloud Run
- Vercel serverless or functions only if request size/runtime constraints are validated
- Expo Router API routes only after explicit refactor
