# PRD 04 And 08 Identity Requirements

Task 03 turns current app identity into release-readiness documentation.

## PRD 04 Architecture Plan

Relevant requirements:

- Create `ai_docs/deployment/README.md` as the deployment architecture and release-flow runbook.
- Preserve the separation between EAS app builds and the separately deployed Express API.
- Keep `app.json` identity aligned before later preview and store-beta work.

## PRD 08 Definition Of Done

Relevant requirements:

- EAS project is initialized and associated with the Expo app.
- Preview iOS build installs on a physical iPhone.
- Preview diagnostics show a non-local HTTPS API URL.
- Deployment runbooks exist under `ai_docs/deployment/`.

## Task 03 Output

The required output is documentation, not a native identifier change:

- Record iOS bundle ID.
- Record Android package.
- Record Apple Team ID from source config.
- Document Apple/Google account assumptions separately from source-controlled config.
