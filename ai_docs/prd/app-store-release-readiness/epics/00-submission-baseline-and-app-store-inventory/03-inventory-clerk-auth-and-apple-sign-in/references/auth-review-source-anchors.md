# Auth Review Source Anchors

Use these anchors when producing the Clerk auth-method and Sign in with Apple decision artifact.

## Local Source Anchors

| Source | Why it matters |
| --- | --- |
| `app/login.tsx` | Custom email/password sign-in and email-code sign-in behavior. |
| `app/signup.tsx` | Custom email/password sign-up, acknowledgement copy, and email-code verification send. |
| `app/verify.tsx` | Email-code verification and missing-requirements recovery path. |
| `app/_layout.tsx` | `ClerkProvider`, protected routes, and required `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`. |
| `lib/config.ts` | Current mobile API config. Future release env flags are not yet implemented. |
| `server/index.mjs` | Clerk session requirement for authenticated translation/history/playback routes and Clerk webhook handling. |
| `ai_docs/prd/app-store-release-readiness/04-gap-analysis.md` | Auth-review gap and reviewer login path requirement. |
| `ai_docs/prd/app-store-release-readiness/08-ios-submission-evaluator-report.md` | Sign in with Apple decision and reviewer demo account acceptance evidence. |
| `ai_docs/prd/app-store-release-readiness/12-app-store-privacy-data-inventory.md` | Clerk data categories and account-management processing context. |

## Official Documentation Anchors

| Source | Use |
| --- | --- |
| https://developer.apple.com/app-store/review/guidelines/ | App Review guidance for full account access during review and social/third-party login requirements. |
| https://clerk.com/docs/guides/development/custom-flows/authentication/email-password | Clerk custom email/password and email verification flow context. |
| https://clerk.com/docs/guides/configure/auth-strategies/social-connections/apple | Clerk Sign in with Apple configuration requirements if Apple social auth becomes needed. |

## Evidence Boundary

Allowed: redacted dashboard setting names, enabled/disabled auth-method summary, reviewer path requirements, and owner confirmation.

Disallowed: Clerk secret keys, webhook signing secrets, session tokens, one-time codes, private user records, full dashboard screenshots with sensitive account data, or reviewer credentials committed to markdown.
