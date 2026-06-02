# Gap Analysis

## Account Deletion

### Current Implementation

`app/account.tsx` exposes:

- Manage profile
- Security
- Translation history
- Sign out

Server code handles Clerk `user.deleted` webhooks and soft-deletes profiles in `server/profiles.mjs`, but there is no user-facing, authenticated app flow that initiates deletion from the app.

### Target Implementation

Add Account -> Privacy and data -> Delete account. The flow must:

- Explain what will be deleted.
- Require explicit confirmation.
- Require recent auth or password/code re-auth if Clerk requires it.
- Call an authenticated API endpoint.
- Delete or anonymize app-owned data and storage.
- Delete or schedule deletion of the Clerk account.
- Sign the user out and show completion guidance.

| Gap | Detail | Action |
| --- | --- | --- |
| Missing UI | No visible delete account entry. | Add Account privacy/data panel. |
| Missing API | No authenticated deletion endpoint. | Add `DELETE /v1/account` or `POST /v1/account/delete`. |
| Storage cleanup | Audio/artifacts are private but deletion flow is not wired. | Reuse storage deletion helpers and record deletion timestamps. |
| Clerk deletion | Webhook handles deletion after the fact, but app cannot initiate it. | Add server-side Clerk user deletion/scheduling flow or documented Clerk-native in-app capability if verified. |

## Legal And Privacy

### Current Implementation

The app has an acknowledgement checkbox during sign-up:

```text
I understand uploaded audio is processed to produce transcripts and translations.
```

There are no public legal docs or in-app legal links in the repo search.

### Target Implementation

Add public legal documents and in-app legal surfaces:

- Privacy Policy
- Terms of Use
- Data Deletion Policy
- AI Processing Disclosure
- Support Contact

| Gap | Detail | Action |
| --- | --- | --- |
| No privacy policy URL | Required in App Store Connect. | Publish stable URL and add metadata. |
| No in-app policy access | Users cannot review legal/data handling from app. | Add Account -> Legal links. |
| AI provider disclosure too broad | Current copy does not name or describe third-party AI processing. | Add explicit consent and policy language. |

## Production Runtime

### Current Implementation

The staging path uses:

- EAS `staging` profile and `preview` EAS environment.
- Cloud Run `darija-api-staging`.
- Trigger.dev Development worker.
- Shared or undecided provider/storage/auth production isolation.

### Target Implementation

Create a production runtime path:

- Cloud Run service: `darija-api-production`
- Trigger.dev production deployment
- Production Clerk keys/webhooks
- Production Supabase project or explicitly isolated production data boundary
- Production provider keys/projects or documented shared-key acceptance
- Production EAS environment values

| Gap | Detail | Action |
| --- | --- | --- |
| Production API deferred | No verified production API URL. | Deploy and smoke test production API. |
| Trigger production deferred | Local worker is not acceptable for public release. | Deploy Trigger production runtime and validate. |
| Resource isolation undecided | Supabase, Clerk, OpenAI, Modal decisions remain human-owned. | Decide and document resource ownership before production build. |

## iOS Native And EAS Submission

### Current Implementation

`app.json` has an iOS bundle ID, Apple team ID, tablet support, `expo-audio`, `expo-secure-store`, `expo-web-browser`, Clerk, `expo-updates`, and `ITSAppUsesNonExemptEncryption=false`.

`eas.json` has a staging submit target with `ascAppId`, but `submit.production` is currently empty.

### Target Implementation

Add an iOS-native readiness gate:

- Production submit profile has an intentional App Store Connect credential strategy.
- Microphone permission copy is product-specific.
- Privacy manifest/App Store upload warnings are reviewed.
- Standard-encryption export-compliance answer is re-confirmed.
- EAS Update policy is documented.
- iPhone and iPad behavior is verified, or tablet support is explicitly changed before submission.

| Gap | Detail | Action |
| --- | --- | --- |
| Production submit config empty | `submit.production` has no iOS `ascAppId` or credential strategy. | Add production submit decision and document where credentials live. |
| Generic microphone prompt | Current prompt says only that the app records audio. | Update copy to explain transcription/translation purpose. |
| Privacy manifest not yet evidenced | Upload warnings are not captured in the PRD. | Add App Store Connect/TestFlight upload warning review task. |
| OTA policy missing | `expo-updates` is enabled but production update rules are absent. | Define what can ship through EAS Update versus binary review. |
| Tablet scope unresolved | `supportsTablet=true` means iPad review quality matters. | Test iPad screenshots/layout or disable tablet support intentionally. |

## Auth Review

### Current Implementation

The app uses Clerk for account creation and sign-in. The PRD does not yet inventory which production Clerk sign-in methods will be enabled.

### Target Implementation

Before App Store submission, record the production Clerk auth methods:

- Email/password or email code.
- Any social or third-party login providers.
- Reviewer demo account path.

| Gap | Detail | Action |
| --- | --- | --- |
| Sign-in method inventory missing | Apple review expectations differ if third-party/social login is offered. | Add Clerk production auth-method inventory and Sign in with Apple decision record. |
| Reviewer login path underspecified | App Review needs a reliable demo path. | Create reviewer account and notes after production runtime is ready. |

## Production UI

### Current Implementation

The main translation UI shows:

- API target label and URL.
- Diagnostics with trace/job/run IDs.
- OpenAI/Darija provider/model metadata.
- QA-oriented wording in signup.

### Target Implementation

Production UI should show the product workflow and results, not implementation internals by default. Diagnostics can remain available only under an explicit support/debug mode.

| Gap | Detail | Action |
| --- | --- | --- |
| API URL visible | Looks like an internal build. | Hide in production. |
| Diagnostics visible | Useful in TestFlight, noisy/risky in public release. | Gate behind debug/support flag. |
| Model internals visible | Good for QA, unnecessary for normal users. | Hide or move to support details. |
| QA copy visible | Signup says fresh-user QA. | Replace with user-facing saved-history copy. |
