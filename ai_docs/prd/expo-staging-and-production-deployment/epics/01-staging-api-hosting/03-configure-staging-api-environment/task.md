# Task 03: Configure Staging API Environment

## Type

Infrastructure

## Context

The deployed API requires server-only credentials for Clerk verification, Supabase service access, Trigger dispatch, Modal Darija ASR, and OpenAI provider calls. These must live on the API host, not in Expo public env.

## Implementation

- Confirm local `gcloud` targets project `darija-to-english-expo`.
- Set or document the local ADC quota project:
  - `gcloud auth application-default set-quota-project darija-to-english-expo`
- Enable or verify required project services before deployment:
  - Cloud Run API
  - Cloud Build API
  - Artifact Registry API
  - Secret Manager API if secrets are stored in Secret Manager rather than direct Cloud Run env vars.
- Current setup verification:
  - `gcloud config get-value project`: `darija-to-english-expo`
  - `gcloud config get-value run/region`: `us-central1`
  - active account: `samisabir212@gmail.com`
  - billing: enabled
  - enabled APIs: Cloud Resource Manager, Service Usage, Cloud Run, Cloud Build, Artifact Registry, Secret Manager
  - ADC token check: passed
- Configure required staging API host env vars:
  - `PORT` or host-provided port behavior.
  - `CLERK_SECRET_KEY`.
  - `SUPABASE_URL`.
  - `SUPABASE_SERVICE_ROLE_KEY`.
  - `OPENAI_API_KEY`.
  - `DARIJA_ASR_BASE_URL` or current equivalent.
  - `DARIJA_ASR_API_KEY`.
  - Trigger.dev dispatch credentials required by the current server.
  - model override variables only when intentionally used.
- Document source of truth for each variable without printing secret values.
- Verify `.env.local` remains local-only and uncommitted.
- Record any missing secret or account permission blocker.

## Acceptance Criteria

- Staging API host has all required non-public server env vars configured.
- Secrets are not committed or pasted into docs.
- Missing credentials are explicitly identified if configuration cannot complete.
- Environment names match current server expectations.

## Dependencies

- Depends On: select-node-api-host

## Technical Notes

- Use current `server/env.mjs` as the source of truth for variable names.
- If the PRD variable names differ from code, code wins and docs should note aliases.
- Do not paste secret values into docs or terminal summaries. Record only variable names and present/missing status.
- Prefer Secret Manager plus a dedicated Cloud Run runtime service account for long-lived server secrets; direct Cloud Run env vars are acceptable for first staging only if the tradeoff is documented.

## Artifact Slots

- `artifacts/`: sanitized env checklist with present/missing status.
- `references/`: `server/env.mjs` variable inventory.
- `resources/`: host-specific env configuration commands.
- `notes/`: secret ownership and blocker notes.
