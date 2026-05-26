# Add In-App Legal Surfaces

## Type

UI

## Context

The PRD requires signed-in users to review legal and data-handling information from inside the app, and the App Store reviewer path expects privacy/support links to be functional. `app/account.tsx` currently exposes profile, security, history, and sign out only, while `lib/config.ts` only exposes `API_BASE_URL`. This task wires mobile-safe legal URLs into the Expo app and makes them discoverable from Account without exposing internal API targets or provider diagnostics.

## Implementation

Extend `lib/config.ts` with `LEGAL_URLS` and missing-URL validation helpers using `EXPO_PUBLIC_LEGAL_*` values from `06-technical-specifications.md`. Add a protected Expo Router legal screen such as `app/legal.tsx`, register it in `app/_layout.tsx`, and add an Account row in `app/account.tsx` near the existing action list. Use `expo-web-browser` `openBrowserAsync` or Expo-compatible `Linking.openURL` for external public URLs. Include Privacy, Terms, Data Deletion, AI Processing Disclosure, and Support; show a visible release-prep error when required URLs are unset.

## Acceptance Criteria

- [ ] Signed-in users can navigate from Account to a Legal or Privacy/Data screen.
- [ ] The legal screen lists Privacy Policy, Terms of Use, Data Deletion Policy, AI Processing Disclosure, and Support using configured public URLs.
- [ ] Missing required legal URL config produces a visible release-prep warning rather than silently hiding required links.
- [ ] Legal UI copy is user-facing and does not expose API URLs, model IDs, Trigger run IDs, provider diagnostics, or secrets.
- [ ] `npm run typecheck` and `npm run lint` pass when this task is executed.

## Dependencies

- Depends On: `publish-legal-policy-sources`
- Blocks: `gate-first-audio-submit-on-consent`
- Blocks: `update-privacy-inventory-and-release-copy`

## Technical Notes

- Follow `app/account.tsx` action-row style and icons; the existing action list is the right integration point.
- `app/_layout.tsx` currently protects `translate`, `account`, and `history`; add the legal route inside the same signed-in stack unless the product decides public signed-out legal access is required.
- `package.json` already includes `expo-web-browser`; Expo docs recommend `openBrowserAsync` for ordinary webpage links such as privacy policies.
- `EXPO_PUBLIC_*` values are bundled into the app, so only public URLs and non-secret release flags belong in this config.

## Artifact Slots

- `artifacts/legal-surface-screenshots.md`: execution-time screenshot notes for Account and Legal screens.
- `references/mobile-legal-surface-anchors.md`: source anchors for Account, Router, config, and link-opening patterns.
- `resources/legal-surface-qa-checklist.md`: manual QA checklist for configured/missing URLs.
- `notes/legal-copy-decisions.md`: copy decisions, fallback behavior, and release-owner blockers.
