# Task 03: Document Production API Path

## Type

Infrastructure

## Context

The mobile binary does not host the backend. `lib/api.ts` talks to `EXPO_PUBLIC_API_BASE_URL`, while `server/index.mjs`, Supabase storage/persistence, Trigger.dev, Modal, OpenAI, and Clerk secrets live outside the app. Epic 06 needs a production API decision even if production deployment is deferred, because a store build without a stable API URL is not release-ready.

## Implementation

- Create or update `ai_docs/deployment/production-api.md`; link it from `ai_docs/deployment/README.md` only if appropriate during execution.
- Ground the plan in `ai_docs/deployment/api-hosting.md`, `server/env.mjs`, `server/index.mjs`, `trigger.config.mjs`, `package.json`, and `ai_docs/deployment/triggerdev.md`.
- Document the target production host shape, candidate Cloud Run service split, required secret names only, health URL pattern, logs, deploy command shape, rollback command shape, and Trigger production deployment dependency.
- Explicitly decide whether production shares or separates Cloud Run service, Supabase project/buckets, Clerk instance/keys, Trigger environment, Modal endpoint, and EAS production public env values.
- Preserve the no-secret rule: list variable names and operational owners, never values.

## Human In The Loop

- Required level: medium.
- Programmatic work: map the current staging API, Trigger, Supabase, Clerk, Modal, OpenAI, and EAS boundaries; draft production runbooks; prepare command placeholders; and identify risks.
- Human decisions: choose whether production is a separate Cloud Run service or shared staging service, whether production uses separate Supabase/Clerk/Trigger/Modal/OpenAI resources, whether Convex migration happens before production, and whether a store beta may temporarily target the staging-backed API.
- Pause points: stop before applying production env vars, creating production cloud resources, changing EAS production public env, deploying Trigger production, or marking a production URL ready without explicit user approval.
- Computer-use option: Codex can assist with cloud-console navigation if needed, but the user must approve account/project choices, billing/resource creation, and production secret configuration.

## Acceptance Criteria

- [ ] Production API runbook exists or `api-hosting.md` has a clearly separated production section.
- [ ] The doc names required production env vars without exposing values.
- [ ] The doc states whether production API deploy is ready, deferred, or blocked, and why.
- [ ] The doc makes production mobile builds no-go until `EXPO_PUBLIC_API_BASE_URL` has a chosen production HTTPS target.
- [ ] Human-owned infrastructure decisions are recorded with the chosen option, owner, and unresolved blockers.
- [ ] Shared-resource risks and rollback paths are explicit across API, Supabase/storage, Trigger, Clerk, Modal, and OpenAI.

## Dependencies

- Depends On: 01-staging-api-hosting/document-api-operations
- Blocks: add-release-rollback-checklist

## Technical Notes

- Current staging API is Cloud Run service `darija-api-staging` in project `darija-to-english-expo`; do not silently reuse it for production without documenting isolation risks.
- `server/env.mjs` is the source of truth for server env validation and forbidden public secret names.
- `server/index.mjs` owns `/health`, `/health/supabase`, authenticated translation routes, and Trigger dispatch.
- Trigger production deploy is currently represented by `npm run trigger:deploy:prod`; production rollout remains deferred until production API, secrets, and storage decisions are made.
- Documentation-only production planning can complete without deploying production, as long as deferred decisions are explicit.

## Artifact Slots

- `artifacts/`: production API plan review template and decision record.
- `references/`: source-map excerpts for API env, health route, Cloud Run staging path, and Trigger runtime.
- `resources/`: command placeholders for production deploy, health check, logs, rollback, and secret-name audit.
- `notes/`: isolation decisions, deferred-resource rationale, and human-owned account actions.
