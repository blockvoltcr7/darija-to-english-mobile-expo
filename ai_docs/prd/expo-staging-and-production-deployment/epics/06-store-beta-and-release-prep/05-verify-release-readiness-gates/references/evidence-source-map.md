# Release Readiness Evidence Source Map

Use this as the source checklist before writing the final readiness report. It maps each gate to existing repo evidence and separates execution evidence from templates or planning docs.

## Direct Evidence To Review

| Gate | Source | Evidence Type | Current Reading |
| --- | --- | --- | --- |
| Staging API health | `ai_docs/deployment/api-hosting.md` | Runbook with verified Cloud Run target and `/health` shape | Staging Cloud Run URL and expected model metadata are documented. Re-run `curl` during task execution before claiming current health. |
| Staging E2E | `ai_docs/prd/expo-staging-and-production-deployment/epics/05-staging-e2e-qa/05-capture-staging-qa-evidence/artifacts/staging-e2e-qa-evidence.md` | Execution artifact | Records a passed physical-iPhone E2E on `2026-05-16T21:27:37Z` against the staging API with Trigger.dev Development worker. |
| Preview device build | `ai_docs/prd/expo-staging-and-production-deployment/epics/04-preview-device-build/status.log` | Status log | Epic 04 preview-device tasks were marked done after earlier iOS credential and dependency blockers. Review related artifacts if store-beta installability is questioned. |
| Trigger runtime | `ai_docs/deployment/triggerdev.md` and `ai_docs/prd/expo-staging-and-production-deployment/epics/03-triggerdev-development-runtime/03-verify-trigger-claims-real-job/artifacts/development-job-evidence-template.md` | Runbook plus execution artifact | Current verified path is local Trigger.dev Development worker, not paid Trigger staging/preview. Production Trigger deploy is deferred. |
| EAS lanes | `eas.json`, `AGENTS.md`, `ai_docs/deployment/README.md` | Local config and runbook | `staging` build profile uses `environment: "preview"` and `channel: "staging"` until the Expo account supports custom environments. Verify API target through diagnostics. |
| Production API path | `ai_docs/deployment/api-hosting.md` and Epic 06 task 03 output when it exists | Runbook plus pending task evidence | Staging API exists. A dedicated production API path is not represented by a separate production runbook in current files. |
| Release rollback | Epic 06 task 04 support files and future execution output | Planning support plus pending execution evidence | Task 04 has support templates, but `ai_docs/deployment/release-checklist.md` is created during execution. Treat rollback coverage as pending until that checklist is written and reviewed. |
| Store beta build/submit | Epic 06 tasks 01 and 02 support files plus future execution output | Planning support plus pending execution evidence | Tasks 01 and 02 have support templates, but no TestFlight or Play testing build/submit is proven until fresh build IDs, submit IDs, and store-processing evidence are captured. |
| Usage controls | `ai_docs/epics/clerk-supabase-triggerdev-foundation/04-usage-controls-and-release-readiness/` | Separate epic specs | Separate usage-control epic has task specs but no visible `status.log` completion evidence. Store beta can be separate from public-release go/no-go, but wider beta/public release should remain blocked until this is verified. |

## Config Anchors

- `app.json`: app identity, bundle IDs, EAS project ID, update URL, runtime version policy.
- `eas.json`: build profiles and submit placeholders.
- `.env.example`: public mobile env boundary and deferred production API URL guidance.
- `lib/config.ts`: mobile API base URL resolution.
- `server/env.mjs`: server-only env contract, body-size defaults, Trigger environment defaults.
- `server/index.mjs`: `/health`, authenticated translation routes, and response metadata.

## Evidence Rules

- Re-run volatile checks during task execution; existing docs are historical evidence.
- Do not paste secrets, Clerk session tokens, private audio contents, full private transcripts, or raw `.env` values.
- Store beta evidence should include build IDs, submit IDs or blocker reason, profile, channel, API target, and install/test status.
- A public-release recommendation must explicitly account for usage controls, legal docs, account deletion, retention, and production API/Trigger readiness.
