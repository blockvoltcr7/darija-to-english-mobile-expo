# Task 02: Add API Host Deployment Config

## Type

Infrastructure

## Context

Once the host is selected, the repo needs the minimal deployment configuration to run `server/index.mjs` as the staging API without changing the mobile API contract.

## Implementation

- Add host-specific config only for the selected platform.
- Ensure the deploy command starts the existing API entrypoint or a thin wrapper around it.
- Confirm the API can bind to the host-provided `PORT`.
- Preserve current routes:
  - `GET /health`
  - `POST /v1/translations`
  - `GET /v1/translations/:id`
- Avoid moving secrets into mobile or public config.
- Add package scripts only if they reduce deployment ambiguity.

## Acceptance Criteria

- Host deployment config exists and is narrowly scoped.
- API startup uses the current server entrypoint.
- No server route contract is changed.
- The deployment can be run by a later executor using documented commands.

## Dependencies

- Depends On: select-node-api-host

## Technical Notes

- Keep `server/index.mjs` as the app contract owner.
- If the host requires a different start script, document why.
- Do not add broad framework migrations.

## Artifact Slots

- `artifacts/`: deployment config diff notes.
- `references/`: selected host runtime docs.
- `resources/`: deploy/start command snippets.
- `notes/`: host-specific implementation decisions.

