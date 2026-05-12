# Task 01: Select Node API Host

## Type

Infrastructure

## Context

Expo native app builds will not host the standalone Express API. The current API must run on an HTTPS Node host that can preserve the existing server contract and secret boundary.

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

## Artifact Slots

- `artifacts/`: host comparison table and final selection note.
- `references/`: host docs excerpts and PRD requirements.
- `resources/`: evaluation checklist.
- `notes/`: account access blockers and tradeoffs.

