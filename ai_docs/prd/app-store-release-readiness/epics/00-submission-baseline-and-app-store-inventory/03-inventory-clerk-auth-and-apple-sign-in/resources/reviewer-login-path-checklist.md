# Reviewer Login Path Checklist

## Auth Method Inventory

| Method | Source-code support | Production Clerk setting | App Review implication | Decision |
| --- | --- | --- | --- | --- |
| Email/password | yes, `app/login.tsx` and `app/signup.tsx` |  | Direct auth path |  |
| Email code/passwordless | yes, `app/login.tsx` and `app/verify.tsx` |  | Direct auth path |  |
| Sign in with Apple | not implemented in app UI at enrichment time |  | Required only if applicable under enabled social/third-party auth decision |  |
| Other social/SSO provider | not implemented in app UI at enrichment time |  | May trigger equivalent-login requirement |  |

## Reviewer Path Requirements

- Reviewer can create or use an account without private phone numbers.
- Reviewer path does not require owner approval during App Review.
- Reviewer path does not require an external social account unless an equivalent compliant path is provided.
- Reviewer notes explain the fastest path through sign-in, email verification, upload/recording, and expected processing time.
- Demo credentials, if used, are entered in App Store Connect reviewer fields, not committed to markdown.

## Questions For Release Owner

- Which Clerk instance is production?
- Which sign-up and sign-in methods are enabled in the production Clerk dashboard?
- Are any social/SSO providers enabled for primary account auth?
- Is Sign in with Apple already configured, not required, or blocked?
- Will reviewers use a pre-created demo account or create a fresh account?

## Artifact Naming

Preferred artifact name:

```text
artifacts/clerk-auth-and-apple-sign-in-decision.md
```
