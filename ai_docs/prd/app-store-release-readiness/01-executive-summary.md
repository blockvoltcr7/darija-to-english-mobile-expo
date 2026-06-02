# Executive Summary

## What

Make Darija to English ready for public iOS App Store review by closing the release blockers around account deletion, privacy/legal disclosure, third-party AI consent, production runtime, App Store metadata, and production UI cleanup.

## Why It Matters Now

The TestFlight build is functionally working, including audio upload, dual STT, consolidation, English translation, and optional English TTS. Public App Store submission has a different bar than TestFlight: Apple reviews privacy disclosures, account deletion, reviewer access, app completeness, data sharing with third-party AI services, production backend availability, and metadata consistency.

The current repo already records that public release is a no-go until production API, production Trigger, usage controls, legal/privacy, and account-deletion gates are complete in `ai_docs/deployment/release-checklist.md`.

## Scope

In scope:

- Add an in-app account deletion path for users who can create accounts.
- Add privacy policy, terms, data deletion, and AI processing disclosures.
- Add explicit consent before audio/transcript content is sent to third-party AI services.
- Remove or gate beta/debug UI from production builds.
- Establish production API, production Trigger runtime, production provider configuration, and release health checks.
- Prepare App Store Connect metadata, privacy labels, reviewer notes, screenshots, and demo account instructions.
- Align iOS privacy manifest and App Store privacy labels with actual data flows.

Out of scope:

- Android Play Store readiness.
- Paid subscription or in-app purchase flows.
- Replacing Clerk, Supabase, Cloud Run, Trigger.dev, Modal, or OpenAI.
- Changing the core translation model pipeline beyond disclosure, safety, and production-readiness needs.
- Combining consolidation and translation into one model call.

## Business Impact

Completing this work reduces App Review rejection risk, creates a defensible privacy posture for audio and transcript processing, and gives the app a production runtime that can handle real users without depending on a local development worker.

