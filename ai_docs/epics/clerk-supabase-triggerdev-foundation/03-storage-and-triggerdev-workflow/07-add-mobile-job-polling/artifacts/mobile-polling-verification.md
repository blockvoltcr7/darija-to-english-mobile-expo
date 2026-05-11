# Mobile Polling Verification

Task: `add-mobile-job-polling`
Date: 2026-05-10

## Result

The mobile submission wrapper now calls:

```http
POST /v1/translations
```

instead of the synchronous `/v1/translate-audio` route.

The app then polls:

```http
GET /v1/translations/:id
```

until the job reaches a terminal status.

## UI State Mapping

Added mobile work states:

- `queued`
- `running`
- `polling`

The main screen shows those states through the existing status pill and disables record/upload while a job is active. Completed jobs are mapped back into the previous `TranslationResult` UI shape so the transcript and English translation surfaces keep rendering the same user-visible fields.

## Cleanup And Stop Conditions

Polling stops on:

- `succeeded`
- `failed`
- `canceled`
- `timeout`
- abort signal from reset/screen cleanup
- polling timeout after 180 seconds

The app still uses Clerk bearer tokens only. No mobile Supabase Storage client or Trigger.dev client was added.

## Validation

Commands run:

```bash
npm run typecheck
npm run lint
```

Static verification:

- `lib/api.ts` submits to `/v1/translations`.
- `lib/api.ts` polls `/v1/translations/:id`.
- `app/index.tsx` passes Clerk token, async status callback, and abort signal.
- `app/index.tsx` exposes queued/running/polling states in the existing UI.
