# Task 05: Add Mobile History Surface

## Type

UI

## Context

Once history endpoints exist, the app needs a minimal user-facing way to revisit previous translations.

## Implementation

- Add `app/history.tsx` or a focused history section in `app/account.tsx`.
- Fetch history through the API with the Clerk session token.
- Implement loading, empty, error, list, and detail states.
- Preserve the current translation screen behavior.

## Acceptance Criteria

- Signed-in user can view recent translations.
- User can open one translation detail.
- UI handles loading, empty, and error states.

## Dependencies

- Depends On: add-history-api-endpoints

## Technical Notes

- Follow existing app styling and Expo Router patterns.
- Do not add subscription/paywall UI in this task.

## Artifact Slots

- `artifacts/`: screenshots and UI state captures.
- `references/`: existing app screen references.
- `resources/`: mock response payloads.
- `notes/`: UI decisions and QA notes.
