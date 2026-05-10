# Production Readiness Roadmap

Date: 2026-05-07

This folder captures the next production path for the Darija to English mobile app after the Clerk authentication migration.

## Executive Decision

Keep Clerk as the identity provider. Add a Postgres-backed product backend around it.

Recommended default:

- Auth: Clerk, already implemented and verified on iOS and Android dev builds.
- Database: Supabase Postgres using Clerk as a third-party auth provider.
- Storage: Supabase Storage for original audio files and generated artifacts.
- API: keep the current Node/Express API initially, but host it on a stable HTTPS platform.
- Jobs: move transcription and translation into async background jobs before public launch.
- Billing: RevenueCat for App Store and Google Play subscriptions.

Alternative if avoiding Supabase entirely:

- Database: Neon Postgres with Clerk-aware row-level security.
- Storage: S3, Cloudflare R2, or equivalent object storage.
- API must own more of the authorization and storage plumbing.

## Why Postgres Is Still Needed

The current app can authenticate and translate, but it does not persist the product state users will expect. Production needs a database for:

- User profile rows mapped to Clerk user IDs.
- Translation history.
- Job status for long-running audio processing.
- Usage metering and quotas.
- Subscription entitlement snapshots.
- Provider run logs, costs, failures, and support diagnostics.
- Account deletion and data export workflows.

Without Postgres, every translation is ephemeral and the server cannot reliably enforce usage limits, recover failed jobs, provide history, or support subscriptions.

## Current State Summary

Done:

- Expo Router app with Clerk native AuthView.
- Protected routes via `Stack.Protected`.
- Clerk session token sent as `Authorization: Bearer <token>`.
- Express API verifies Clerk session before model calls.
- iOS and Android Clerk auth tested with native dev builds.
- Dual STT pipeline works through server code: OpenAI STT plus Modal Darija ASR, then OpenAI consolidation and translation.

Not done:

- Production database.
- Audio/object storage.
- Translation history.
- Async queue/job model.
- Production API hosting.
- Usage limits and abuse controls.
- Subscription entitlement integration.
- Legal/account deletion/review compliance.
- EAS build/submit configuration.
- Production observability and cost controls.

## Roadmap Files

- [01-current-state-and-gaps.md](01-current-state-and-gaps.md): source-grounded audit of what exists and what is missing.
- [02-roadmap-to-users.md](02-roadmap-to-users.md): phased roadmap from current repo to beta and store release.
- [03-postgres-and-data-model.md](03-postgres-and-data-model.md): recommended database and schema direction.
- [04-next-action-items.md](04-next-action-items.md): immediate task backlog ordered by dependency.
- [05-clerk-supabase-auth-solidification-plan.md](05-clerk-supabase-auth-solidification-plan.md): Clerk identity, Supabase DB/storage, webhook sync, and Postgres trigger boundary.

## Epic Package

- [../epics/clerk-supabase-triggerdev-foundation/README.md](../epics/clerk-supabase-triggerdev-foundation/README.md): implementation epics and tasks for Clerk-native Supabase persistence, buckets, Trigger.dev workflow, and usage controls.

## External References Checked

- Expo EAS build/store docs: https://docs.expo.dev/deploy/build-project/
- Clerk Expo native components: https://clerk.com/docs/reference/expo/native-components/overview
- Clerk Expo quickstart: https://clerk.com/docs/expo/getting-started/quickstart
- Supabase with Clerk: https://supabase.com/docs/guides/auth/third-party/clerk
- Clerk with Supabase database: https://clerk.com/docs/guides/development/integrations/databases/supabase
- Neon RLS with Clerk: https://neon.com/docs/guides/neon-rls-authorize-clerk
- RevenueCat Expo SDK: https://www.revenuecat.com/docs/getting-started/installation/expo
- Apple App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Google Play Payments policy: https://support.google.com/googleplay/android-developer/answer/9858738
