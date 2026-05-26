# Add Delete Account UI

## Type

UI

## Context

The App Store release-readiness PRD identifies the missing in-app deletion path as a public-submission blocker: users can create Clerk accounts, but `app/account.tsx` currently exposes only profile, security, translation history, and sign out. PRD goals require any signed-in user to initiate account deletion from inside the app, and the success metric requires the deletion entry to be discoverable from Account settings in no more than two taps. This task adds the mobile initiation and confirmation surface while staying aligned with the policy mapping, legal/privacy copy, and server-mediated deletion flow owned by sibling tasks.

## Implementation

- Update `app/account.tsx` near the existing `AccountAction` list to add a clear Privacy/Data or Delete Account entry reachable from Account in one tap; use the existing dark card/action-row styling and Ionicons pattern.
- Add a small delete-account panel/modal or route-local component that presents consequence copy, cancellation, loading, success, failure, reauthentication-required, and partial-failure states.
- Add a typed `deleteAccount()` client wrapper in `lib/api.ts`, with response types in `lib/types.ts`, following the bearer-token fetch/error handling patterns used by history calls.
- Call the backend contract from task `03-add-authenticated-account-deletion-api` (`DELETE /v1/account`) only with a fresh Clerk session token, explicit confirmation value, and safe optional reason/preference fields.
- On completed or scheduled deletion, clear sensitive local UI state and sign out or route to `/login` according to the API response. Never display transcripts, audio contents, storage object keys, raw tokens, or private provider details in copy or diagnostics.

## Acceptance Criteria

- [ ] A signed-in user can open Account and reach Delete Account in no more than two taps.
- [ ] The UI explains the account, saved translation history, original audio, generated audio artifacts, and provider-retention limitations using release-ready user-facing language.
- [ ] The destructive API call cannot run from a single accidental tap; it requires explicit confirmation after the consequence summary is visible.
- [ ] The UI handles cancellation, loading, success/completed, scheduled, reauthentication-required, partial-failure, and generic failure states without exposing secrets or private content.
- [ ] The mobile call uses the shared API layer with `Authorization: Bearer <Clerk session token>` and does not send a client-supplied `clerk_user_id`.
- [ ] Successful completion or scheduling signs the user out or provides clear next-step guidance that matches the final server response contract.

## Dependencies

- Depends On: `map-account-deletion-policy-to-data`
- Depends On: `01-legal-privacy-and-consent/add-in-app-legal-surfaces`
- Depends On: `add-authenticated-account-deletion-api`
- Blocks: `verify-deletion-access-denial-and-evidence`

## Technical Notes

- `app/account.tsx` already imports `useClerk`, `useUser`, `Alert`, `ActivityIndicator`, `Pressable`, and `Ionicons`; extend those patterns instead of introducing a new UI framework for this screen.
- `lib/api.ts` centralizes API base URL, bearer-token fetch calls, and `readError()` handling. Add account deletion there rather than calling `fetch()` directly from the screen.
- `lib/types.ts` should define a narrow response model such as `AccountDeletionStatus = 'completed' | 'scheduled' | 'reauthentication_required' | 'partial_failure' | 'failed' | string` plus safe counts/messages only.
- Server-side authority remains `req.clerkAuth.userId` from `server/index.mjs`; the UI must never collect or submit a Clerk user ID as deletion authority.
- Apple guidance allows confirmation and reauthentication steps, but the path must remain easy to find and must not become an unnecessary support-only flow for this app.

## Artifact Slots

- `artifacts/`: Future execution screenshots or a sanitized UI state matrix only; do not add speculative evidence during enrichment.
- `references/source-anchors.md`: PRD, Apple guidance, and code anchors used to implement the UI.
- `resources/delete-account-ui-qa-checklist.md`: Manual UI checks for discoverability, states, copy, and safe redaction.
- `notes/copy-and-state-decisions.md`: Release-copy constraints, response-state assumptions, and unresolved decisions for execution.
