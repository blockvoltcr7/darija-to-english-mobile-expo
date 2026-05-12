# 02 — Problem Statement

## Current State

| Area | Current Behavior | Source |
| --- | --- | --- |
| Mobile app | Expo Router app configured in `app.json`; local start scripts in `package.json`. | `app.json`, `package.json` |
| iOS/Android identifiers | iOS bundle ID and Android package exist. | `app.json` |
| API base URL | Defaults to `http://localhost:8787` for iOS simulator or `http://10.0.2.2:8787` for Android emulator unless `EXPO_PUBLIC_API_BASE_URL` is set. | `lib/config.ts` |
| Backend API | Standalone Express server verifies Clerk, stores audio, creates translation rows, dispatches Trigger.dev, and serves polling endpoints. | `server/index.mjs`, `server/AGENTS.md` |
| Async worker | Trigger.dev task claims stored jobs and runs provider orchestration. | `trigger/translate-audio-job.mjs`, `trigger/AGENTS.md` |
| Provider calls | OpenAI, Modal, and Supabase credentials remain server-side. | `AGENTS.md`, `server/AGENTS.md` |
| EAS config | No `eas.json` is currently present. | `rg --files` current repo check |
| Deployment visualization | HTML visual exists and is stored in the project docs. | `ai_docs/html-visuals/darija-expo-deployment-map.html` |

## The Gap

| Missing Piece | Why It Blocks Staging / Production | Required Action |
| --- | --- | --- |
| EAS build profiles | There is no canonical way to build development, preview, staging, and production binaries. | Add `eas.json`. |
| Staging API URL | Phone builds cannot reach `localhost:8787`. | Deploy the Express API to HTTPS and set `EXPO_PUBLIC_API_BASE_URL`. |
| API hosting decision | Expo native builds do not host the standalone Express API. | Choose a Node API host and document deployment. |
| EAS environment configuration | Builds need environment-specific public config. | Set EAS env values for preview/staging/production. |
| Trigger.dev deployment | The async worker must run outside local `trigger.dev dev`. | Deploy Trigger staging/prod environments. |
| Release QA runbook | Current QA is local-dev oriented. | Add staging phone QA and release-candidate checks. |
| Observability checklist | Failures must be traceable across app, API, Trigger, Supabase, Modal, and OpenAI. | Define logs and proof artifacts. |

## Key Differences Beyond The Obvious

### Expo Build Is Not Backend Deployment

EAS Build creates native app binaries. It does not automatically deploy the standalone Express API in `server/index.mjs`.

### Physical Devices Cannot Use Simulator Defaults

`http://localhost:8787` is valid for iOS simulator when the API runs on the Mac. It is not valid for a physical iPhone or production build.

### Trigger.dev Is A Separate Runtime

The API can enqueue a job, but the worker must be connected and deployed to claim and execute it. The prior queued-job failure mode came from a missing worker, not from the mobile app itself.

### EAS Hosting Is A Later Refactor Option

EAS Hosting can serve Expo Router API routes, but this app currently has a full Express API. Moving to Expo Router API routes would be a backend migration, not a deployment toggle.
