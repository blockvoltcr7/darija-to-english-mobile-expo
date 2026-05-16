# Task 03: Update Mobile Upload Client

## Type

Code

## Context

The mobile app currently reads audio and submits base64 through REST. Convex storage should upload file/blob content directly to an upload URL.

## Implementation

- Convert selected or recorded audio URI into an uploadable body.
- Request a Convex upload URL.
- POST the audio to the upload URL.
- Submit or finalize the translation job with returned `storageId`.
- Preserve diagnostics for trace ID, filename, byte size, MIME type, and status.

## Acceptance Criteria

- Record and upload flows both use the upload URL path.
- Mobile no longer sends large base64 JSON for new translation jobs.
- Diagnostics remain useful for simulator/device QA.
- Provider keys remain server-side.

## Dependencies

- `create-upload-url-flow`

## Validation Commands

```bash
npm run typecheck
npm run lint
npx expo-doctor
```

## Artifact Slots

- `artifacts/`: iOS simulator upload proof.
- `notes/`: React Native file/blob compatibility issues.

