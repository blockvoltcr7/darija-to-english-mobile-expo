# Task 01: Configure Trigger Environments

## Type

Infrastructure

## Context

The deployment PRD requires a deployed Trigger.dev staging worker before real-device staging QA can pass. The staging API is already hosted on Cloud Run and queues jobs through `server/index.mjs`; this task makes the Trigger staging environment line up with the same project, Supabase resources, provider credentials, and `translate-audio-job` runtime described in PRD sections `04 - Architecture Plan`, `05 - Technical Specifications`, and `08 - Definition Of Done`.

## Implementation

- Inspect `trigger.config.mjs`, `package.json`, `.env.example`, `server/env.mjs`, and `ai_docs/deployment/api-hosting.md` for the current Trigger project ref, environment names, scripts, and secret naming.
- Configure or document Trigger.dev `staging` and `prod` environment values by name only; never paste secret values.
- Keep the API dispatch secret and worker runtime secrets aligned with the Cloud Run staging API, especially Supabase URL/key, OpenAI key, Modal Darija ASR URL/key, and `TRIGGER_PROJECT_REF`.
- Capture any missing Trigger login, org/project access, environment support, or secret ownership as a blocker in task-local notes.

## Acceptance Criteria

- [ ] Trigger.dev staging environment requirements are documented with exact variable names and owners.
- [ ] Trigger.dev production deployment path is documented but not executed.
- [ ] Staging Trigger resources are confirmed compatible with the existing Cloud Run staging API and Supabase project.
- [ ] No secret values, Clerk tokens, provider tokens, or private audio contents are committed.
- [ ] Any auth/project-access blocker includes the exact command attempted and sanitized error.

## Dependencies

- Depends On: `01-staging-api-hosting/verify-staging-api-health`
- Blocks: `deploy-trigger-staging-worker`

## Technical Notes

- `trigger.config.mjs` currently defaults `project` from `TRIGGER_PROJECT_REF` with fallback `proj_tehveeweadzwantwpvpr` and loads task dirs from `./trigger`.
- `package.json` defines `trigger:deploy:staging` as `trigger.dev deploy --config trigger.config.mjs --env staging` and `trigger:deploy:prod` as `trigger.dev deploy --config trigger.config.mjs --env prod`.
- `server/env.mjs` treats `TRIGGER_SECRET_KEY` as the async dispatch gate and defaults `TRIGGER_ENVIRONMENT` to `dev`; Cloud Run sets `TRIGGER_ENVIRONMENT=staging` in `ai_docs/deployment/api-hosting.md`.
- The worker imports server pipeline code from `trigger/translate-audio-job.mjs`, so Trigger runtime env must satisfy both Trigger SDK needs and `server/translation-pipeline.mjs` provider/Supabase needs.

## Artifact Slots

- `artifacts/trigger-env-checklist-template.md`: sanitized checklist for configured environment names and secret presence.
- `references/trigger-runtime-source-map.md`: local source map for Trigger config, API dispatch, worker runtime, and PRD contract.
- `resources/trigger-env-commands.md`: repeatable commands for inspecting and setting Trigger environment state.
- `notes/environment-decisions.md`: staging/prod ownership, account-access blockers, and resource-sharing decisions.
