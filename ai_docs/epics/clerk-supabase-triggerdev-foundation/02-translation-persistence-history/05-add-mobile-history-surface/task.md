# Task 05: Add Mobile History Surface

## Type

UI

## Context

The product value of persistence is visible only when signed-in users can revisit previous translations. This task adds a minimal Expo Router history surface backed by the new API endpoints while preserving the current first-screen translation tool.

## Implementation

- Add `app/history.tsx` as a protected route and register it in `app/_layout.tsx`.
- Add API client functions in `lib/api.ts`, for example `listTranslations({ accessToken })` and `getTranslation({ accessToken, id })`, with types in `lib/types.ts`.
- Add an entry point from the existing signed-in UI, preferably a compact icon/button near the account affordance in `app/index.tsx` or a row in `app/account.tsx`.
- Build loading, empty, error, refreshing, list, and selected-detail states using existing palette/style patterns from `app/index.tsx` and `app/account.tsx`.
- Display English translation, consolidated Darija, provider/model metadata, status, created/completed timestamps, and filename when available.
- Keep all data fetching through the Express API with `Authorization: Bearer <Clerk token>`.

## Acceptance Criteria

- [ ] Signed-in users can navigate to a history screen.
- [ ] History screen fetches through `/v1/translations` with a Clerk token.
- [ ] Users can open or expand one translation detail.
- [ ] Loading, empty, error, refreshing, list, and detail states are implemented.
- [ ] The existing recording/upload translation workflow in `app/index.tsx` is unchanged.
- [ ] `npm run typecheck` and `npm run lint` pass after mobile changes.

## Dependencies

- Depends On: `add-history-api-endpoints`
- Blocks: `verify-history-access-controls`

## Technical Notes

- Existing protected route setup lives in `app/_layout.tsx`.
- Existing API auth pattern is `translateAudioFile` in `lib/api.ts`, which receives a Clerk token and sends `Authorization`.
- Existing result display in `app/index.tsx` shows the hierarchy to reuse: English translation first, consolidated Darija second, raw provider transcripts lower.
- Do not add billing, subscription, retention, storage-management, or Trigger.dev polling UI in this epic.

## Artifact Slots

- `artifacts/`: screenshots for loading, empty, list, detail, and error states.
- `references/`: mobile route and UI contract notes.
- `resources/`: mock list/detail response payloads.
- `notes/`: UI decisions and QA notes.
