# Product Goals And Success Metrics

## Goals

1. Allow any signed-in user to initiate account deletion from inside the app.
2. Clearly disclose audio, transcript, translation, generated audio, account, diagnostics, and provider-processing data flows.
3. Obtain explicit user consent before processing audio/transcripts with third-party AI services.
4. Ship a production-ready iOS build that does not expose TestFlight/debug diagnostics by default.
5. Run public release traffic on production API, Trigger, storage, auth, and provider configuration.
6. Provide App Review with a demo account, reviewer notes, and sample instructions that let review complete without private developer intervention.
7. Align App Store privacy labels, privacy manifest, App Store metadata, and in-app disclosures with the actual implementation.

## Success Metrics

| Metric | Target | How To Verify |
| --- | --- | --- |
| Account deletion discoverability | Delete account entry visible from Account settings in <= 2 taps. | Launch signed-in app, open Account, verify visible deletion path. |
| Account deletion execution | Deletion removes or anonymizes Clerk profile, app profile, jobs/results, provider metadata, and storage objects according to policy. | Run deletion against a test user and verify Clerk, Supabase rows, and private storage objects. |
| Privacy policy availability | Privacy policy URL is public and linked in app and App Store Connect. | Open URL without auth; inspect app Legal/Privacy link; inspect metadata draft. |
| Third-party AI consent | User must actively accept before first audio processing call. | Fresh install, sign up, attempt upload/record; verify consent gate appears before API call. |
| Production runtime | `/health` and one authenticated job succeed against production API and production Trigger runtime. | Run production smoke test and capture sanitized `traceId`, `jobId`, `triggerRunId`, terminal status. |
| Debug gating | Production build does not show API URL, diagnostics panel, QA wording, or internal model metadata by default. | Build production profile and inspect main translation/history/account flows. |
| App Store privacy labels | Metadata includes audio data, user content, identifiers/contact info, diagnostics/usage as applicable. | Review App Store Connect privacy answers against data inventory. |
| App Review access | Reviewer can sign in with demo account and complete one translation path. | Use reviewer credentials from a clean device; submit audio; verify result. |
| Usage safety | Rate limits and kill switch prevent uncontrolled paid usage. | Trigger limit paths in staging/production-like test and verify safe error responses. |

