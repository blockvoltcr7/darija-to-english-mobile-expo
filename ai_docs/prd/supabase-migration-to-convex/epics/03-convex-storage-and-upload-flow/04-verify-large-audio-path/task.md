# Task 04: Verify Large Audio Path

## Type

QA

## Context

The prior server accepted large base64 payloads. The Convex migration must prove larger audio files use direct upload and do not hit HTTP action body limits.

## Implementation

- Test a small fixture and a larger non-sensitive fixture.
- Verify upload URL POST succeeds.
- Verify job metadata stores accurate byte size and MIME type.
- Verify worker can download and process the stored audio.
- Verify failure messages are actionable for oversized or unsupported files.

## Acceptance Criteria

- Large audio path avoids Convex HTTP action body limits.
- Unsupported audio types fail before provider calls.
- Oversized files fail before provider calls.
- No private audio contents are copied into artifacts.

## Dependencies

- `replace-supabase-storage-adapter`
- `update-mobile-upload-client`

## Validation Commands

```bash
npx convex dev
npm run typecheck
npm run lint
npx expo-doctor
```

## Artifact Slots

- `artifacts/`: sanitized upload QA matrix.
- `notes/`: upload size limit decision.

