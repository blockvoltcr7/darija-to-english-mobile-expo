# Task 01: Configure Trigger Environments

## Type

Infrastructure

## Context

The Trigger.dev account currently includes Development and Production, while additional Staging/Preview environments require an upgrade. This task deliberately scopes Epic 03 to the included Development environment: keep the worker local with `trigger.dev dev`, align it with the reachable API path, and document production as a future paid/release decision.

## Implementation

- Inspect `trigger.config.mjs`, `package.json`, `.env.example`, `server/env.mjs`, and `ai_docs/deployment/api-hosting.md` for the current Trigger project ref, environment names, scripts, and secret naming.
- Configure or document Trigger.dev Development environment values by name only; never paste secret values.
- Keep the API dispatch secret and worker runtime secrets aligned with the development API path in use, especially Supabase URL/key, OpenAI key, Modal Darija ASR URL/key, and `TRIGGER_PROJECT_REF`.
- Record that Trigger.dev Staging/Preview environments are intentionally out of scope unless the account is upgraded.
- Capture any missing Trigger login, org/project access, environment support, or secret ownership as a blocker in task-local notes.

## Acceptance Criteria

- [ ] Trigger.dev Development environment requirements are documented with exact variable names and owners.
- [ ] Production deployment path is documented as a future release decision but not executed.
- [ ] Development worker resources are confirmed compatible with the API path used for QA.
- [ ] Paid Trigger.dev additional environments are called out as deferred.
- [ ] No secret values, Clerk tokens, provider tokens, or private audio contents are committed.
- [ ] Any auth/project-access blocker includes the exact command attempted and sanitized error.

## Dependencies

- Depends On: `01-staging-api-hosting/verify-staging-api-health`
- Blocks: `run-trigger-development-worker`

## Technical Notes

- `trigger.config.mjs` currently defaults `project` from `TRIGGER_PROJECT_REF` with fallback `proj_tehveeweadzwantwpvpr` and loads task dirs from `./trigger`.
- `package.json` defines `trigger:dev` as `trigger dev --config trigger.config.mjs`; run it with `--env-file .env.local` when local secrets are needed.
- `trigger.dev deploy --env` supports paid/release deployment lanes such as `prod` and `staging`; do not use that path for this development-only scope.
- `server/env.mjs` treats `TRIGGER_SECRET_KEY` as the async dispatch gate and defaults `TRIGGER_ENVIRONMENT` to `dev`.
- The worker imports server pipeline code from `trigger/translate-audio-job.mjs`, so Trigger runtime env must satisfy both Trigger SDK needs and `server/translation-pipeline.mjs` provider/Supabase needs.

## Artifact Slots

- `artifacts/trigger-env-checklist-template.md`: sanitized checklist for configured environment names and secret presence.
- `references/trigger-runtime-source-map.md`: local source map for Trigger config, API dispatch, worker runtime, and PRD contract.
- `resources/trigger-env-commands.md`: repeatable commands for inspecting and setting Trigger environment state.
- `notes/environment-decisions.md`: Development environment ownership, account-access blockers, and deferred paid-environment decisions.
