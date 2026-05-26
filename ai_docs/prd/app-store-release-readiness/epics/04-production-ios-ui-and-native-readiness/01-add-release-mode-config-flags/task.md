# Add Release Mode Config Flags

## Type

Infrastructure

## Context

The PRD release environment contract in `06-technical-specifications.md` requires production-safe public Expo config before the UI can hide diagnostics, link legal surfaces, and produce App Store screenshots. `lib/config.ts` currently exposes only `CONFIG.API_BASE_URL`, so downstream UI tasks would otherwise invent their own environment parsing and risk leaking server-only assumptions into the mobile bundle.

## Implementation

Extend `lib/config.ts` using `references/release-config-source-anchors.md`. Add a tiny parser for `EXPO_PUBLIC_APP_ENV`, `EXPO_PUBLIC_ENABLE_DIAGNOSTICS`, legal URLs, `EXPO_PUBLIC_AI_CONSENT_VERSION`, and `EXPO_PUBLIC_OTA_UPDATE_POLICY_VERSION`, then export `CONFIG.APP_ENV`, `CONFIG.IS_PRODUCTION`, `CONFIG.ENABLE_DIAGNOSTICS`, `CONFIG.LEGAL_URLS`, and version fields. Keep `API_BASE_URL` fallback behavior intact. Update release docs or task artifacts with the safe public env matrix from `resources/production-env-matrix.md`.

## Acceptance Criteria

- [ ] `CONFIG` exposes release-mode, diagnostics, legal URL, consent version, and OTA policy version fields without breaking existing `API_BASE_URL` imports.
- [ ] Diagnostics are disabled by default when `EXPO_PUBLIC_APP_ENV=production` unless `EXPO_PUBLIC_ENABLE_DIAGNOSTICS=true` is explicitly set.
- [ ] Local iOS simulator and Android emulator API fallback behavior still works when no API base URL is configured.
- [ ] Public/mobile env documentation separates safe `EXPO_PUBLIC_*` values from server-only secrets.
- [ ] No OpenAI, Modal, Supabase service-role, Trigger, Clerk secret, Apple credential, or `.env` value is added to mobile config or committed docs.

## Dependencies

- Depends On: `03-production-runtime-and-abuse-controls/configure-production-auth-storage-and-providers`
- Depends On: `01-legal-privacy-and-consent/update-privacy-inventory-and-release-copy`
- Blocks: `hide-production-diagnostics-and-provider-internals`
- Blocks: `replace-qa-and-permission-copy`
- Blocks: `verify-record-upload-playback-and-permission-states`

## Technical Notes

- Current anchor: `lib/config.ts` reads `EXPO_PUBLIC_API_BASE_URL` and normalizes simulator/emulator localhost behavior.
- PRD anchor: `06-technical-specifications.md` lists the suggested public env names and server-only names.
- Expo EAS docs classify `EXPO_PUBLIC_*` values as client-side bundle inputs; treat them as public even if EAS visibility is sensitive.
- Keep the release contract stable and typed because `app/translate.tsx`, `app/history.tsx`, `app/signup.tsx`, and `app/account.tsx` will all depend on it.

## Artifact Slots

- `artifacts/release-config-contract-summary.md`: execution-time summary of final config fields and env classification.
- `references/release-config-source-anchors.md`: local PRD/code and official docs that justify the config contract.
- `resources/production-env-matrix.md`: safe public env matrix for development, preview/staging, and production builds.
- `notes/release-config-decisions.md`: unresolved legal URL, consent-version, OTA-version, or production env ownership decisions.
