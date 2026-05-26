# Delete Account UI Source Anchors

## PRD Anchors

- `ai_docs/prd/app-store-release-readiness/02-problem-statement.md`: identifies the missing account deletion flow as an App Store readiness blocker and targets an Account -> Privacy/Data -> Delete account flow backed by server deletion.
- `ai_docs/prd/app-store-release-readiness/03-product-goals-success-metrics.md`: sets the goal that any signed-in user can initiate account deletion in app and the success metric that the entry is discoverable from Account settings in no more than two taps.
- `ai_docs/prd/app-store-release-readiness/05-architecture-plan.md`: assigns Account, Legal, and Delete Account entries to `app/account.tsx`, and keeps provider/service-role calls server-side.
- `ai_docs/prd/app-store-release-readiness/09-implementation-phases.md`: places Account -> Privacy/Data -> Delete Account UI in Phase 2 with the authenticated deletion API and user-scoped cleanup.
- `ai_docs/prd/app-store-release-readiness/12-app-store-privacy-data-inventory.md`: classifies email, user ID, audio, transcripts/translations, generated artifacts, diagnostics, and usage records as data that the deletion flow must describe truthfully.

## Code Anchors

- `app/account.tsx`: current Account screen; the existing `AccountAction` list is the closest UI pattern for adding a Privacy/Data or Delete Account entry.
- `lib/api.ts`: shared mobile API client; follow the `listTranslations()` and `getTranslation()` bearer-token request patterns for `deleteAccount()`.
- `lib/types.ts`: shared TypeScript contracts; add a safe account deletion response type here instead of ad hoc screen-local response shapes.
- `server/index.mjs`: Clerk auth middleware derives `req.clerkAuth.userId` from the verified session; the mobile UI must not send `clerk_user_id` as deletion authority.

## External App Store Guidance

- Apple, [Offering account deletion in your app](https://developer.apple.com/support/offering-account-deletion-in-your-app/): apps with account creation must let users initiate deletion in-app; the option should be easy to find, transparent, and may include confirmation or reauthentication when it does not make deletion unnecessarily difficult.
- Apple, [App Review Guidelines 5.1.1(v)](https://developer.apple.com/app-store/review/guidelines/): apps that support account creation must offer account deletion within the app, and privacy/data deletion policies must be understandable to users.
