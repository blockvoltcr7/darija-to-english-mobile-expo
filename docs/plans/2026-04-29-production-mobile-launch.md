# Atlas Voice Production Mobile Launch Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert the current Expo/local API MVP into a store-approvable paid mobile app with authentication, usage limits, subscription entitlements, production API hosting, and operational controls.

**Architecture:** Keep the Expo app as the mobile client, but move transcription/translation behind an authenticated hosted API. Use Supabase for auth, Postgres, profiles, usage ledger, and row-level security; use RevenueCat for iOS/Android subscriptions and entitlement sync; use server-side metering and rate limits before calling OpenAI or Modal.

**Tech Stack:** Expo React Native, EAS development/build/submit, Node/Express production API, Supabase Auth/Postgres, RevenueCat, Apple App Store Connect, Google Play Console, OpenAI API, Modal Darija ASR, Sentry/PostHog or equivalent analytics.

---

## Launch Architecture

Current MVP flow:

Audio file or recording -> local Expo app -> local API `/translate-audio` -> OpenAI STT + Modal Darija ASR -> GPT-5.5 consolidation -> GPT-5.5 translation -> mobile UI.

Production flow:

Authenticated mobile user -> entitlement and usage check -> hosted API `/v1/translate-audio` -> usage reservation -> OpenAI STT + Modal Darija ASR -> consolidation -> translation -> usage finalization -> history record -> mobile UI.

The mobile client must never call OpenAI or Modal directly. All paid gates, usage accounting, API keys, abuse protection, and logs belong on the server.

## Product Scope for Store Approval

Ship the narrowest paid product:

- Sign in with Apple, Google, and email magic link or OTP.
- Free allowance for testing value before purchase.
- Subscription paywall before additional translations.
- Upload audio and record audio.
- Show consolidated Darija transcript, English translation, raw model transcripts, and model metadata.
- Translation history.
- Account screen with restore purchases, manage subscription, delete account, privacy policy, terms, and support email.

Avoid launching with broad claims like legal advice, medical advice, emergency interpretation, or government service replacement. Position it as transcription/translation assistance for understanding Moroccan Darija.

## Billing Decision

Use RevenueCat for launch.

Reasons:

- Apple requires in-app purchase for unlocking digital features or functionality inside an app.
- Google Play requires Google Play Billing for in-app purchases of digital goods/services distributed through Google Play.
- Expo Go cannot fully test real native purchases; use an EAS development build.
- RevenueCat gives a single entitlement layer over StoreKit and Google Play Billing.

Initial entitlement:

- `pro`: grants paid translation minutes.

Initial products:

- Monthly subscription: `atlas_voice_pro_monthly`.
- Annual subscription: `atlas_voice_pro_annual`.

Recommended MVP limits:

- Free: 5 minutes total or 3 translations, whichever comes first.
- Pro monthly: 120 processed audio minutes per month.
- Pro annual: same monthly allowance, discounted annual price.
- TTS optional and capped separately.

## Backend Data Model

Create tables:

- `profiles`: user identity and app metadata.
- `entitlements`: current RevenueCat entitlement snapshot.
- `usage_ledger`: immutable usage reservations and final charges.
- `translations`: user-owned translation history.
- `api_events`: request status, latency, model, character counts, and failure reason.

Meter by processed audio seconds, not just request count. Always reserve usage before calling models and finalize after completion.

## Security Requirements

- Verify Supabase JWT on every production API request.
- Enforce entitlement and usage limits server-side.
- Never trust client-reported duration; compute or validate audio size/duration on the server.
- Limit upload size and duration.
- Rate-limit by user ID, IP, and device where practical.
- Store OpenAI, Modal, Supabase service-role, and RevenueCat webhook secrets only on the server.
- Add CORS allowlist for web only; native mobile calls do not need broad browser CORS.
- Strip or minimize sensitive logs. Do not log full transcripts by default in production.

## Task 1: Production API Hosting

**Files:**
- Modify: `server/index.mjs`
- Create: `server/auth.mjs`
- Create: `server/usage.mjs`
- Create: `server/env.mjs`
- Modify: `.env.example`
- Modify: `README.md`

**Steps:**
1. Extract environment validation into `server/env.mjs`.
2. Add production variables for Supabase URL, Supabase JWT secret or JWKS verification, Supabase service-role key, RevenueCat webhook secret, max upload MB, max free minutes, and paid plan limits.
3. Add API version prefix `/v1`.
4. Keep `/health` unauthenticated but hide sensitive endpoint details in production.
5. Add `/v1/translate-audio` authenticated route.
6. Deploy the API to a stable HTTPS host.
7. Verify from iPhone and Android emulator using HTTPS API base URL.

## Task 2: Supabase Auth

**Files:**
- Create: `lib/supabase.ts`
- Create: `app/auth.tsx`
- Modify: `app/_layout.tsx`
- Modify: `app/index.tsx`
- Create: `supabase/migrations/001_initial_schema.sql`

**Steps:**
1. Install Supabase React Native dependencies.
2. Configure Supabase client with AsyncStorage session persistence.
3. Add auth screens for email and Apple/Google sign-in.
4. Add authenticated/unauthenticated routing.
5. Attach JWT bearer token to every API request.
6. Add logout and account screen.
7. Test session persistence after app restart.

## Task 3: Usage Meter

**Files:**
- Create: `server/usage.mjs`
- Modify: `server/index.mjs`
- Create: `supabase/migrations/002_usage.sql`
- Modify: `app/index.tsx`

**Steps:**
1. Create immutable `usage_ledger` table.
2. Add `reserveUsage(userId, estimatedSeconds)` before model calls.
3. Add `finalizeUsage(reservationId, actualSeconds, costEstimate)` after model calls.
4. Add `releaseUsage(reservationId, reason)` on failed requests.
5. Block requests when the user has no entitlement and free allowance is exhausted.
6. Return remaining minutes to the mobile app.
7. Display remaining minutes in the UI and paywall.

## Task 4: RevenueCat Subscriptions

**Files:**
- Modify: `package.json`
- Create: `lib/revenuecat.ts`
- Create: `app/paywall.tsx`
- Create: `server/revenuecat-webhook.mjs`
- Modify: `server/index.mjs`
- Create: `supabase/migrations/003_entitlements.sql`

**Steps:**
1. Install RevenueCat React Native SDK.
2. Create RevenueCat project, iOS app, Android app, products, offerings, and `pro` entitlement.
3. Add RevenueCat initialization after auth.
4. Add paywall screen with monthly and annual products.
5. Add restore purchases button.
6. Add RevenueCat webhook endpoint.
7. Verify webhook signatures.
8. Sync entitlement updates into Supabase.
9. Block paid-only usage on server unless entitlement is active or free allowance remains.
10. Test purchases in Apple sandbox and Google Play internal testing.

## Task 5: Store-Ready Builds

**Files:**
- Modify: `app.json`
- Create: `eas.json`
- Modify: `README.md`

**Steps:**
1. Configure bundle IDs/package names.
2. Add app icon, splash, privacy manifests/permissions copy, microphone usage description, and document picker rationale.
3. Configure EAS development, preview, and production profiles.
4. Build iOS development client.
5. Build Android development client.
6. Test real RevenueCat purchases in development builds.
7. Build store binaries.
8. Submit to TestFlight and Google internal/closed testing.

## Task 6: App Review Compliance

**Files:**
- Create: `docs/legal/privacy-policy.md`
- Create: `docs/legal/terms.md`
- Create: `docs/legal/support.md`
- Modify: `app/account.tsx`

**Steps:**
1. Publish privacy policy, terms, support, and deletion request pages.
2. Add in-app links to privacy policy and terms.
3. Add delete account flow.
4. Add restore purchases.
5. Add manage subscription link.
6. Add clear pricing, renewal terms, trial terms if any, and cancellation explanation.
7. Fill App Privacy labels accurately for audio, transcripts, identifiers, purchases, diagnostics, and analytics.
8. Do not send users to external payment pages for app-unlocked digital usage.

## Task 7: Observability and Cost Controls

**Files:**
- Create: `server/logging.mjs`
- Create: `server/costs.mjs`
- Modify: `server/index.mjs`
- Modify: `app/index.tsx`

**Steps:**
1. Add request IDs across client and server.
2. Add structured logs for request started, entitlement checked, usage reserved, each model completed, usage finalized, and response sent.
3. Add Sentry or equivalent crash reporting.
4. Add analytics for install, signup, paywall viewed, purchase started, purchase completed, upload started, translation completed, and failure.
5. Add daily spend alert thresholds.
6. Add per-user and global circuit breakers.
7. Add admin-visible daily cost/revenue dashboard.

## Task 8: Beta and Launch

**Files:**
- Modify: `README.md`
- Create: `docs/beta-test-plan.md`
- Create: `docs/store-listing.md`

**Steps:**
1. Recruit 20 testers.
2. Prepare 10 known audio samples for regression testing.
3. Run iOS TestFlight.
4. Run Google closed testing if required for the account.
5. Collect failure logs and UX notes.
6. Submit app review at least two weeks before June 30, 2026.
7. Launch with subscription active on day one.

## Acceptance Criteria

- A real user can install the app, sign in, upload or record audio, receive a translation, and see remaining usage.
- A free user is blocked after the free allowance and shown a paywall.
- A paid user can purchase, restore purchases, and continue translating.
- The server rejects unauthenticated requests.
- The server rejects over-limit users even if the client is modified.
- Apple review has privacy policy, terms, account deletion, restore purchases, and in-app purchase.
- Google Play has billing, data safety, privacy policy, and closed/internal testing path completed.

## Source Notes

- Apple App Review Guidelines require in-app purchase for unlocking app features/functionality.
- Google Play Payments policy requires Google Play Billing for in-app purchases of digital goods/services distributed through Google Play.
- RevenueCat Expo docs state real native purchase testing requires a development build; Expo Go can preview/mock subscription logic but not perform real purchases.
- Supabase Expo docs support React Native auth with AsyncStorage session persistence.
