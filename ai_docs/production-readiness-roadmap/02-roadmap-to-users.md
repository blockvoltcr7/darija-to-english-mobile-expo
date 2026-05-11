# Roadmap To Users

## Finish Line Definition

A user can install the app from TestFlight or Google internal testing, sign in, record or upload Darija audio, receive an English translation, return later to see translation history, and continue only within their allowed free or paid usage.

The server must reject unauthenticated, over-limit, oversized, and abusive requests even if the mobile client is modified.

## Phase 0: Stabilize The Current Clerk Build

Status: mostly complete.

Deliverables:

- Keep Clerk configured for iOS and Android native apps.
- Keep `@clerk/expo` pinned to `3.2.8` until a newer version is explicitly retested.
- Keep project skill `.agents/skills/darija-mobile-auth-qa` for repeatable auth QA.
- Add a short release checklist that says which iOS/Android auth tests passed.

Acceptance criteria:

- iOS dev build reaches protected app screen after Clerk sign-in.
- Android dev build reaches protected app screen after Clerk sign-in.
- Verification commands pass.

## Phase 1: Add Postgres Persistence

Goal: introduce durable product state while keeping the current synchronous translation endpoint working.

Recommended path:

- Add Supabase Postgres with Clerk third-party auth support.
- Create migration files in a new `db/` or `supabase/migrations/` folder.
- Add server-side DB client.
- Add a `profiles` upsert on first authenticated API call.
- Add `translations` table and write completed results after the current sync pipeline returns.

Acceptance criteria:

- Every authenticated translation has a `translations` row tied to a Clerk user ID.
- The account screen or home screen can load the user's recent translations.
- A user cannot read another user's rows.

## Phase 2: Move Audio To Object Storage

Goal: stop sending large base64 payloads as the durable system of record.

Deliverables:

- Add storage bucket for original audio.
- Add server-generated upload flow or server-side upload acceptance.
- Store `audio_object_key`, `filename`, `mime_type`, `size_bytes`, and retention metadata.
- Keep storage access private by default.

Acceptance criteria:

- Translation rows reference stored audio objects.
- The server can process from storage.
- Audio retention can be configured or disabled per product policy.

## Phase 3: Convert Translation To Async Jobs

Goal: make long-running model work reliable on mobile networks.

Deliverables:

- Replace direct `POST /v1/translate-audio` UX with job creation.
- Add status states: `queued`, `running`, `succeeded`, `failed`, `canceled`.
- Add worker execution for OpenAI STT, Modal ASR, consolidation, and translation.
- Add retry policy with idempotency keys.
- Add app polling or realtime job updates.

Acceptance criteria:

- API returns a job ID quickly.
- User can leave and come back while a job continues.
- Failed jobs persist a user-safe error reason and internal trace ID.

## Phase 4: Add Usage Metering And Abuse Controls

Goal: protect paid provider costs before broader beta.

Deliverables:

- `usage_ledger` table for immutable reservations and final charges.
- Free allowance policy, for example 3 translations or 5 processed minutes.
- Monthly paid allowance policy.
- Rate limits by Clerk user ID and IP.
- Max file size and max duration enforcement.
- Global kill switch for provider spend.

Acceptance criteria:

- Free users are blocked after allowance is exhausted.
- Over-limit requests are rejected before OpenAI or Modal calls.
- Failed jobs release or adjust reservations correctly.

## Phase 5: Add Billing And Entitlements

Goal: support paid mobile launch.

Deliverables:

- Add RevenueCat SDK to the Expo app.
- Configure App Store and Google Play products.
- Add RevenueCat webhook endpoint on the API.
- Mirror entitlement state into Postgres.
- Add paywall, restore purchases, manage subscription, and entitlement refresh.

Acceptance criteria:

- iOS sandbox purchase grants entitlement.
- Android internal test purchase grants entitlement.
- Restore purchases works.
- Server enforces entitlement from trusted backend state, not client-only flags.

## Phase 6: Production Hosting And Observability

Goal: make the system operable outside local development.

Deliverables:

- Deploy Express API to HTTPS.
- Add production environment validation.
- Add structured JSON logs with trace IDs.
- Add Sentry or equivalent crash/error reporting.
- Add provider latency, failure rate, usage, and cost dashboards.
- Add runbook for OpenAI outage, Modal outage, and high spend.

Acceptance criteria:

- Real device builds use production HTTPS API URL.
- Support can trace one translation from mobile request to provider runs.
- Alerts exist for error spikes and daily spend thresholds.

## Phase 7: Store And Beta Readiness

Goal: get real users testing safely.

Deliverables:

- Add `eas.json`.
- Build iOS and Android development, preview, and production profiles.
- Create privacy policy, terms, support, and account deletion docs/screens.
- Add App Store and Google Play listing copy.
- Prepare 10 representative Darija audio samples for regression testing.
- Recruit a small beta cohort.

Acceptance criteria:

- TestFlight build install works.
- Google internal or closed testing build install works.
- Beta users can sign in, translate, view history, hit limits, and report issues.

## Proposed Milestone Order

1. Postgres persistence and translation history.
2. Production hosted API.
3. Storage and async jobs.
4. Usage meter and quotas.
5. RevenueCat subscriptions.
6. EAS preview builds for beta.
7. Legal/store compliance.
8. TestFlight and Google internal testing.
9. Public launch.

This order gets useful beta feedback before deep monetization polish, while still protecting model spend before broad distribution.
