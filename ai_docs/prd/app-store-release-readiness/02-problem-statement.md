# Problem Statement

## Current State

| Area | Current Implementation | Evidence |
| --- | --- | --- |
| Public app entry | Signed-out landing page routes users to create account or sign in. | `app/index.tsx` |
| Auth | Clerk email/password and email-code flows. | `app/login.tsx`, `app/signup.tsx`, `app/verify.tsx` |
| Account screen | Profile, security, history, and sign out. | `app/account.tsx` |
| Translation | Authenticated audio upload/recording sends audio to the API for dual STT, consolidation, translation, and optional TTS. | `app/translate.tsx`, `lib/api.ts`, `server/index.mjs`, `server/translation-pipeline.mjs` |
| Storage | Original audio and generated TTS artifacts are stored privately in Supabase Storage. | `server/storage.mjs`, `supabase/migrations/20260510222509_add_storage_metadata_to_translation_jobs.sql`, `supabase/migrations/20260521204700_create_translation_artifacts.sql` |
| Runtime | Current store-beta path uses EAS `staging` build profile, Cloud Run staging API, and Trigger.dev Development worker. | `ai_docs/deployment/release-checklist.md`, `ai_docs/deployment/triggerdev.md` |
| App privacy/legal | No public legal docs or in-app legal/privacy links were found. | repo search |
| App Store production readiness | Existing docs say public release is no-go. | `ai_docs/deployment/release-checklist.md` |

## The Gap

| Gap | Why It Blocks App Store Readiness | Target |
| --- | --- | --- |
| No clear account deletion flow | Apple requires apps with account creation to let users initiate deletion in-app. | Add discoverable Account -> Privacy/Data -> Delete account flow backed by server deletion. |
| Privacy policy missing | App Store Connect requires a privacy policy URL; apps must explain data collection/use. | Publish privacy policy and link it from app and App Store metadata. |
| Third-party AI consent incomplete | Audio/transcripts are sent to OpenAI and Modal; Apple guidance requires clear disclosure and permission before sharing personal data with third-party AI. | Add explicit pre-processing consent naming the categories of data and third-party AI processing. |
| Production backend deferred | Public review requires stable backend availability; local Trigger.dev Development worker is not production-grade. | Deploy production API and production Trigger runtime with verified provider/secrets isolation. |
| Debug/beta UI visible | API URL, diagnostics, model internals, and QA language make the app look like an internal testing build. | Gate diagnostics and model internals behind non-production/debug flags. |
| App privacy labels and privacy manifest drift | The app collects user account data, audio, transcripts, translations, diagnostics, and generated audio metadata. | Update App Store privacy answers and iOS privacy manifest as applicable. |
| Usage and abuse controls incomplete | Public users can trigger paid provider calls. | Add rate limits, kill switch, quota/usage reservation, and observability before public release. |

## Key Differences Beyond The Obvious

- TestFlight success does not prove App Review readiness; Apple reviews metadata, privacy, legal, deletion, and production availability.
- Backend-only legal and deletion docs are not enough; the user must find key privacy/deletion paths in the app.
- The AI disclosure is not only a privacy policy issue; the app sends user audio/transcripts to third-party model providers during normal use.
- Production release needs runtime isolation decisions, not just a new EAS build number.

