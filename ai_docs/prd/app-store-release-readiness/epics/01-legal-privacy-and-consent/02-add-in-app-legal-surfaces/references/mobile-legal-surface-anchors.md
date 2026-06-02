# Mobile Legal Surface Anchors

## Existing App Anchors

- `app/account.tsx`: action list currently includes Manage profile, Security, and Translation history. Add the Legal/Privacy entry here.
- `app/_layout.tsx`: protected stack currently registers `translate`, `account`, and `history`. Register the legal route in the same signed-in stack unless legal access is intentionally made public.
- `lib/config.ts`: currently exports only `API_BASE_URL`; extend it with public legal URLs and release flags.
- `package.json`: already includes `expo-web-browser`, `expo-linking`, and `expo-router`.

## PRD Anchors

- `ai_docs/prd/app-store-release-readiness/06-technical-specifications.md`: suggested public env names include `EXPO_PUBLIC_LEGAL_PRIVACY_URL`, `EXPO_PUBLIC_LEGAL_TERMS_URL`, and `EXPO_PUBLIC_LEGAL_DELETE_ACCOUNT_URL`.
- `ai_docs/prd/app-store-release-readiness/07-ui-and-store-metadata-changes.md`: Account target includes Privacy and data, Legal, and Delete account.
- `ai_docs/prd/app-store-release-readiness/09-implementation-phases.md`: Phase 1 adds legal screen/routes and legal URLs.

## External Docs

- Expo WebBrowser: https://docs.expo.dev/versions/latest/sdk/webbrowser/
- Expo environment variables: https://docs.expo.dev/guides/environment-variables/
- EAS environment variables: https://docs.expo.dev/eas/environment-variables/

## Implementation Cautions

- `EXPO_PUBLIC_*` values are public in the app bundle. Do not add provider keys, Clerk secret keys, Supabase service-role keys, or Trigger secrets to mobile config.
- Legal links should open public URLs. Authentication flows should not reuse the same browser call unless a future task explicitly introduces auth sessions.
- Missing legal URLs should be visible in release-prep builds so App Store metadata blockers are caught before submission.
