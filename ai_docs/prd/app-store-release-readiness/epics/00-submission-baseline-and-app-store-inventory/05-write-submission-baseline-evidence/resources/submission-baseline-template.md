# Submission Baseline Evidence Template

Copy this structure into an execution-time artifact such as:

```text
artifacts/submission-baseline-evidence.md
```

Do not treat this template as evidence.

## Summary

| Field | Value |
| --- | --- |
| Evidence date |  |
| Repo commit |  |
| Release owner |  |
| Baseline status | Ready / Blocked / Needs owner review |
| Sanitization reviewer |  |

## Baseline Matrix

| Area | Confirmed source | Decision or current state | Downstream impact | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| App identity | Task 01 artifact |  |  |  |  |
| EAS build lanes | Task 01 artifact |  |  |  |  |
| EAS submit strategy | Task 02 artifact |  |  |  |  |
| Production API/runtime | deployment docs or owner evidence |  |  |  |  |
| Clerk auth methods | Task 03 artifact |  |  |  |  |
| Sign in with Apple | Task 03 artifact |  |  |  |  |
| Encryption export | Task 04 artifact |  |  |  |  |
| Tablet support | Task 04 artifact |  |  |  |  |
| EAS Update policy | Task 04 artifact |  |  |  |  |

## Downstream Handoff

| Epic | Dependency from baseline | Ready? | Notes |
| --- | --- | --- | --- |
| 01 Legal, Privacy, And Consent | Auth methods, data categories, legal URL assumptions |  |  |
| 02 Account Deletion And Data Lifecycle | Clerk account path, data categories, privacy boundary |  |  |
| 03 Production Runtime And Abuse Controls | Production API/runtime and provider ownership assumptions |  |  |
| 04 Production iOS UI And Native Readiness | Tablet, permission, diagnostics, OTA policy |  |  |
| 05 App Store Submission Package And TestFlight Evidence | Submit strategy, reviewer path, screenshots, privacy labels |  |  |

## Open Questions

| Question | Owner | Blocks | Required next check |
| --- | --- | --- | --- |
|  |  |  |  |

## Redaction Review

Confirm the baseline does not include:

- `.env` or `.env.local` values.
- API keys, provider secrets, service-role keys, or Trigger secrets.
- Clerk session tokens, secret keys, webhook signing secrets, one-time codes, or private user records.
- Apple passwords, 2FA codes, App Store Connect API private key material, `.p8` files, or credential screenshots.
- Private audio contents, full transcripts, generated audio bytes, or provider request bodies.

## Release-Owner Acceptance

| Field | Value |
| --- | --- |
| Accepted by |  |
| Accepted date |  |
| Accepted with blockers? |  |
| Notes |  |
