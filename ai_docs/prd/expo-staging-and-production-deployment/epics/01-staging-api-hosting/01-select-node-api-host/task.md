# Task 01: Select Node API Host

## Type

Infrastructure

## Context

Expo native app builds will not host the standalone Express API. The current API must run on an HTTPS Node host that can preserve the existing server contract and secret boundary.

The staging Google Cloud project has been created and selected in the local `gcloud` CLI:

- Project ID: `darija-to-english-expo`
- Default Cloud Run region: `us-central1`
- Active local account observed during setup: `samisabir212@gmail.com`
- Billing: enabled
- Required APIs verified enabled: Cloud Resource Manager, Service Usage, Cloud Run, Cloud Build, Artifact Registry, and Secret Manager
- Application Default Credentials: token available after quota-project setup

## Implementation

- Compare candidate hosts against the PRD requirements:
  - Node 20+ or compatible runtime.
  - Express or HTTP server support.
  - HTTPS.
  - persistent env secrets.
  - accessible logs and rollback.
  - outbound access to Clerk, Supabase, Trigger.dev, Modal, and OpenAI.
  - request body support for current base64 audio uploads.
- Prefer the lowest-risk host for the current Express API.
- Document the selected host and any account/auth setup required.
- Identify any request-size or cold-start risks before deployment config work begins.

## Acceptance Criteria

- A staging API host is selected or a precise decision blocker is recorded.
- Host requirements are checked against the current app contract.
- Request body and runtime constraints are explicitly documented.
- Deployment work can proceed without revisiting basic host fit.

## Dependencies

- None.

## Technical Notes

- Do not refactor to Expo Router API routes in this task.
- Vercel serverless/functions should only be selected if body-size/runtime constraints are verified.
- Render, Fly.io, Railway, and Google Cloud Run are plausible options.
- If Google Cloud Run is selected, use the global `gcp-cloud-run` skill as the deployment reference for Cloud Run service shape, container deployment commands, logs, IAM, and rollback notes.
- Use the dedicated Google Cloud project `darija-to-english-expo` for this app's staging API unless the user explicitly changes the project decision.
- Before Cloud Run deployment, re-check billing/API/region state only if the local `gcloud` configuration changes or a deployment command reports a permission/quota issue.

## Artifact Slots

- `artifacts/`: host comparison table and final selection note.
- `references/`: host docs excerpts and PRD requirements.
- `resources/`: evaluation checklist.
- `notes/`: account access blockers and tradeoffs.
