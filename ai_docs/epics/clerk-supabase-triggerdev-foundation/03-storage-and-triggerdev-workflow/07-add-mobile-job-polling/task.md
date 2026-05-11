# Task 07: Add Mobile Job Polling

## Type

UI

## Context

After `POST /v1/translations` returns a queued job, the mobile app can no longer assume submit means final translation response. It must submit audio, show async job progress, poll the authenticated history/detail endpoint, and render the completed result in the existing translation UI shape. Mobile must continue using Clerk tokens only; it must not read Supabase Storage or Trigger.dev directly.

## Implementation

- Add `submitTranslationJob` to `lib/api.ts` for `POST /v1/translations`, plus any response types in `lib/types.ts`.
- Update `app/index.tsx` to use the async route for new submissions, map queued/running/polling/succeeded/failed states into the existing recording/upload UI, and poll `getTranslation` until terminal status.
- Reuse `useAuth().getToken()` and existing history/detail types; do not add a mobile Supabase client or Trigger.dev client.
- Define polling interval, max wait, backoff behavior, manual retry/reload behavior, and how a succeeded detail maps back into `TranslationResult`.
- Keep a documented fallback to the sync route only if needed during rollout.

## Acceptance Criteria

- [ ] Mobile submission calls `POST /v1/translations` with Clerk bearer token and current audio payload.
- [ ] UI shows queued/running/polling states without blocking on provider work in the request.
- [ ] Completed jobs render the same user-visible transcript/translation fields as the previous sync flow.
- [ ] Failed jobs show safe error text from the job detail response.
- [ ] Polling stops on succeeded, failed, canceled, timeout, sign-out, or screen lifecycle cleanup.

## Dependencies

- Depends On: dispatch-triggerdev-from-api
- Blocks: verify-async-job-flow

## Technical Notes

- Existing sync helper: `lib/api.ts` `translateAudioFile`.
- Existing history helpers: `lib/api.ts` `listTranslations` and `getTranslation`.
- Existing UI entry point: `app/index.tsx`; existing history/detail UI: `app/history.tsx`.
- Existing `WorkStatus` in `lib/types.ts` lacks queued/running/polling states and should be updated or wrapped deliberately.
- Keep Expo public env limited to `EXPO_PUBLIC_API_BASE_URL` and Clerk publishable key.

## Artifact Slots

- `artifacts/`: screenshots or simulator notes for queued, running, succeeded, failed, and timeout states.
- `references/`: async API response contract and mobile state mapping notes.
- `resources/`: mock job responses for each terminal/non-terminal status.
- `notes/`: polling interval, timeout, fallback, and UX copy decisions.
