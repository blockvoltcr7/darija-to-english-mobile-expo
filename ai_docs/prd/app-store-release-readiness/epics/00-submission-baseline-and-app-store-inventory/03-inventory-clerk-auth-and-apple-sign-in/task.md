# Inventory Clerk Auth And Apple Sign In

## Type

Infrastructure

## Context

The PRD identifies auth review as an App Store submission gate because Apple review expectations change when an app offers third-party or social login. Current app code implements custom Clerk email/password and email-code flows, but production Clerk dashboard settings may differ from source code. This task creates a release-owner-backed auth-method inventory and a Sign in with Apple decision before reviewer notes, demo account setup, consent, and final submission work depend on the login path.

## Implementation

Use Task 01 identity/runtime findings, `app/login.tsx`, `app/signup.tsx`, `app/verify.tsx`, `app/_layout.tsx`, `lib/config.ts`, `server/index.mjs`, and PRD auth-review sections to document the production Clerk sign-in methods. Gather release-owner-provided dashboard evidence as redacted notes, not raw screenshots with secrets. Record email/password, email-code/passwordless, and any social/SSO providers. If any third-party or social provider is enabled for primary account auth, record whether Sign in with Apple is required, already configured, or explicitly blocked. Define the reviewer-safe login path Epic 05 should use.

## Acceptance Criteria

- [ ] A Clerk auth-method and Sign in with Apple decision record is written under `artifacts/`.
- [ ] The record separates source-code-supported auth flows from production Clerk dashboard settings.
- [ ] Sign in with Apple status is explicit and tied to enabled production social/third-party providers.
- [ ] Reviewer login requirements are clear enough for Epic 05 to create reviewer notes and a demo path.
- [ ] No Clerk secret keys, webhook signing secrets, session tokens, private user records, one-time codes, or sensitive dashboard screenshots are captured.

## Dependencies

- Depends On: `inventory-ios-config-and-runtime`
- Blocks: `write-submission-baseline-evidence`
- Blocks: `05-app-store-submission-package-and-testflight-evidence/create-reviewer-demo-account-path`
- Blocks: `01-legal-privacy-and-consent/add-consent-gate-before-audio-submit`

## Technical Notes

- Code anchors: `app/login.tsx` supports email/password sign-in and email-code sign-in; `app/signup.tsx` creates email/password accounts and sends email verification codes; `app/_layout.tsx` requires `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` and wraps the app in `ClerkProvider`.
- Apple's App Review guidance expects full app access for account-based apps during review and has additional requirements when third-party/social login is used for primary account auth.
- If production offers only direct email/password or email-code auth, the current PRD treats Sign in with Apple as not automatically required. If Google, Facebook, LinkedIn, Apple, or another social/SSO provider is enabled, reopen this decision before submission.
- Production Clerk keys and webhooks remain part of Epic 03; this task inventories auth methods and reviewer path only.

## Artifact Slots

- `artifacts/`: Clerk auth-method inventory, Sign in with Apple decision record, and reviewer-login requirement summary
- `references/`: source-code, PRD, Apple, and Clerk auth anchors
- `resources/`: reviewer login path checklist and redaction checklist
- `notes/`: unresolved auth-review questions, dashboard access blockers, and owner confirmations
