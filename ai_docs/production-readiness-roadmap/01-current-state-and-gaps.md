# Current State And Gaps

## Current Runtime Flow

Mobile app:

- `app/_layout.tsx` wraps the app in `ClerkProvider`.
- `app/sign-in.tsx` renders Clerk native `AuthView`.
- `app/_layout.tsx` protects `index` and `account` with `Stack.Protected`.
- `app/index.tsx` gets a Clerk token with `getToken()` before translation.
- `lib/api.ts` posts to `${CONFIG.API_BASE_URL}/v1/translate-audio`.

Server:

- `server/index.mjs` loads Clerk server keys.
- `clerkMiddleware()` runs when Clerk is configured.
- `requireClerkSession` rejects unauthenticated requests before model calls.
- `/v1/translate-audio` validates `{ filename, audio_base64 }`.
- Server runs Modal Darija ASR and OpenAI STT in parallel.
- Server consolidates the two transcripts with OpenAI.
- Server translates the consolidated transcript to English.
- Server returns raw transcripts, consolidated transcript, translation, and provider metadata.

Configuration:

- `app.json` has iOS bundle ID and Android package set to `com.samisabiridrissi.darijatoenglish`.
- `app.json` has scheme `darijaenglish`.
- `package.json` has `@clerk/expo` pinned to `3.2.8` for Android build reliability.
- `.env.example` documents Clerk, OpenAI, Modal, and API base URL variables.

## Verified

- Clerk auth works on iOS dev build.
- Clerk auth works on Android dev build.
- Clerk test-user OTP `424242` works with `+clerk_test` email addresses.
- Android dev build requires JDK 17 in this repo.
- `node --check server/index.mjs`, `npm run typecheck`, `npm run lint`, and `npx expo-doctor` passed after the Clerk Android fix.

## Gaps Blocking Real Users

### 1. No Persistent Product Data

There is no database. The app cannot store translation history, user profile state, usage counters, subscription state, job status, or audit/support data.

Impact:

- Users lose translations after leaving the screen.
- Support cannot inspect a failed job.
- The server cannot enforce per-user limits over time.
- There is no clean account deletion or data export path.

### 2. Audio Is Sent As Base64 In Request Body

The mobile app reads audio into base64 and sends it directly to the API. The server has a JSON body limit but no durable storage.

Impact:

- Large audio files increase memory pressure.
- Long requests can time out.
- Failed processing cannot be resumed.
- There is no artifact retention policy.

Production direction:

- Upload original audio to object storage.
- Store only metadata and storage object keys in Postgres.
- Process audio from storage in a background worker.

### 3. Processing Is Synchronous

The API currently waits for OpenAI STT, Modal ASR, consolidation, and translation before responding.

Impact:

- Mobile requests can time out.
- Provider slowness ties up API workers.
- Retries can duplicate expensive model calls.

Production direction:

- `POST /v1/translations` creates a job row and returns a job ID.
- Worker processes the job asynchronously.
- App polls `GET /v1/translations/:id` or subscribes to status updates.

### 4. No Usage Meter Or Cost Guard

There is no quota, rate limit, free allowance, or monthly cap.

Impact:

- Any authenticated user can trigger paid OpenAI and Modal calls.
- Abuse or accidental repeated submissions can create cost spikes.

Production direction:

- Reserve usage before model calls.
- Finalize usage after actual duration/cost is known.
- Enforce per-user, per-IP, and global circuit breakers.

### 5. No Billing Or Entitlements

There is no subscription layer.

Impact:

- The app cannot charge users for ongoing translation usage.
- Store release is incomplete if this is a paid digital service.

Production direction:

- Use RevenueCat for iOS and Android subscriptions.
- Mirror entitlement snapshots into Postgres.
- Enforce entitlements server-side before model calls.

### 6. No Production Hosting Contract

The API is local only in the current repo workflow.

Impact:

- Devices outside local development cannot use the app.
- There is no production HTTPS API base URL.

Production direction:

- Host the Express API on a stable HTTPS runtime.
- Configure EAS profiles with production API URLs.
- Keep all OpenAI, Modal, Clerk secret, DB, and billing secrets server-side.

### 7. No Store Release Configuration

There is no `eas.json`, store metadata, legal docs, subscription review flow, or release checklist.

Impact:

- The app is not ready for TestFlight, Google internal testing, or public store review.

Production direction:

- Add EAS development, preview, and production profiles.
- Add app icon, splash, privacy/permission copy, privacy policy, terms, support, and delete-account flow.
- Verify Apple and Google purchase policy requirements before launch.

## Outdated Or Superseded Docs

`docs/plans/2026-04-29-production-mobile-launch.md` and `docs/prd/expo-mobile-supabase-implementation/*` still describe a Supabase Auth direction. The current code has pivoted to Clerk Auth.

Keep the useful production concepts from those docs, especially usage metering, RevenueCat, hosted API, legal docs, and observability, but do not reintroduce Supabase Auth unless the product deliberately reverses the Clerk decision.
