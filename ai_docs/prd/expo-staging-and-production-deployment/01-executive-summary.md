# 01 — Executive Summary

## What

Create a production-ready deployment plan for the Darija to English Expo app, including EAS build profiles, preview/staging distribution, production app-store release preparation, separately deployed API hosting, Trigger.dev worker deployment, and environment-specific API configuration.

## Why It Matters Now

The app currently works in local simulator/dev workflows, but the mobile client still defaults to local API URLs when `EXPO_PUBLIC_API_BASE_URL` is not set. A production or physical-device build cannot rely on `http://localhost:8787`; on a real phone, `localhost` points to the phone, not the developer Mac. The current app also has a standalone Express API and Trigger.dev worker that do not automatically deploy with an Expo native app build.

Without a staging deployment path:

- Fresh-user E2E QA cannot be run as a production-like phone install.
- TestFlight or internal testers will hit unreachable local API URLs.
- API secrets, provider credentials, and Trigger worker environments remain local-only.
- The team cannot distinguish code-complete from release-ready.

## Scope In

- Add EAS build and submit configuration for `development`, `preview`, `staging`, and `production`.
- Define and configure environment-specific `EXPO_PUBLIC_API_BASE_URL` values.
- Deploy the existing Node/Express API at a reachable HTTPS staging endpoint and later a production endpoint.
- Deploy Trigger.dev staging and production workers using the existing project scripts.
- Preserve server-owned secrets for OpenAI, Modal, Clerk, Supabase, and Trigger.dev.
- Add deployment and QA runbooks for iOS physical device, TestFlight, Android internal testing, and production release.
- Verify fresh Clerk user signup, audio upload, async Trigger execution, and translated result display against a staging API.

## Scope Out

- Refactoring `server/index.mjs` into Expo Router API routes.
- Replacing Clerk, Supabase, Trigger.dev, Modal, or OpenAI.
- Adding billing, usage quotas, or public launch legal copy beyond deployment prerequisites.
- Reworking the translation pipeline behavior.
- Moving provider calls into the mobile client.

## Business Impact

This work converts the app from a local/demo workflow into a controlled beta-release system. It allows the app to be installed on real phones, validated with real authentication and audio uploads, and promoted toward TestFlight/App Store/Play Store release without exposing secrets or relying on developer-local infrastructure.
