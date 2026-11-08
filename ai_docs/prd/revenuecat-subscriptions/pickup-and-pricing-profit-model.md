# RevenueCat Pickup And Pricing Profit Model

## Superseded Pricing Note

The setup checkpoint in this file is still useful, but the old quota examples below were rough placeholders.

Use `pricing-cost-analysis-2026-06-07.md` as the current pricing and quota source of truth. That later memo uses the actual current pipeline, official vendor pricing checked on 2026-06-07, Apple/RevenueCat proceeds, and per-job cost estimates.

Current recommendation:

- Do not launch unlimited Pro.
- Prefer minute-based quotas over job-count quotas.
- Free: 3 Understand minutes/month + 1 Reply audio/month.
- Pro $9.99/month: 12 Understand minutes/month + 20 Reply audio messages/month.
- Pro Plus $14.99/month: 18-20 Understand minutes/month + 30 Reply audio messages/month.

Production blocker: the current active `pro` entitlement path must not bypass all usage limits. Add paid-plan quotas before charging real users.

## Where We Left Off

The RevenueCat subscription code and server enforcement work are in progress locally, but the App Store product setup is not finished.

Completed setup:

- RevenueCat project: `Darija to English`
- RevenueCat iOS app: `Darija to English iOS`
- Bundle ID: `com.samisabiridrissi.darijatoenglish`
- RevenueCat entitlement: `pro`
- RevenueCat offering: `default`
- Apple In-App Purchase key was configured in RevenueCat.
- App Store Connect API key was configured in RevenueCat.
- Apple vendor number was found and saved: `93449028`
- Local docs exist at `ai_docs/prd/revenuecat-subscriptions/README.md`.
- Native RevenueCat packages are installed:
  - `react-native-purchases`
  - `react-native-purchases-ui`

Stopped at:

- RevenueCat Product Catalog had no iOS products.
- RevenueCat Import was disabled because no App Store Connect subscription product existed yet.

Next external setup step:

1. Create an Apple auto-renewable subscription product in App Store Connect.
2. Import or add that product in RevenueCat.
3. Attach the product to RevenueCat entitlement `pro`.
4. Add the product to offering `default`.
5. Configure the RevenueCat paywall.
6. Configure RevenueCat webhook delivery to the production API.
7. Deploy backend/runtime.
8. Build a new iOS development or TestFlight build.

Recommended v1 Apple product shape:

```text
Product ID: darija_pro_monthly
Reference name: Darija Pro Monthly
Display name: Darija Pro
Billing period: Monthly
RevenueCat entitlement: pro
RevenueCat offering: default
```

## Pricing Problem

The product must be priced so that normal usage always leaves gross margin after Apple fees and variable AI/runtime costs.

This app has real variable costs:

- OpenAI speech-to-text, text generation, translation, and TTS.
- Modal-hosted Darija ASR.
- Trigger.dev/API processing.
- Convex storage/database operations.
- Generated audio playback/share bandwidth.
- Support, failed jobs, retries, and abuse.
- Apple App Store commission.

The safest pricing model is not only a subscription price. It is:

```text
Subscription price + monthly usage quota + hard server-side quota enforcement
```

## Profit Formula

For each paid plan:

```text
net_revenue = subscription_price * (1 - apple_commission_rate)
gross_profit = net_revenue - expected_monthly_variable_cost_per_user
gross_margin = gross_profit / net_revenue
```

Where:

```text
expected_monthly_variable_cost_per_user =
  (included_translation_jobs * average_translation_job_cost)
+ (included_reply_jobs * average_reply_job_cost)
+ average_storage_bandwidth_cost
+ average_retry_failure_cost
+ support_and_misc_buffer
```

Recommended minimum target:

```text
gross_margin >= 60%
```

If gross margin is lower than that, either raise price, reduce included usage, or make heavy usage an upgrade path.

## Practical V1 Recommendation

Start with a conservative plan:

```text
Free:
  3 to 5 translations per month
  3 to 5 reply generations per month
  ephemeral results by default
  no saved history beyond explicit product decision

Pro Monthly:
  $4.99/month or $9.99/month
  fixed monthly translation quota
  fixed monthly reply quota
  saved history enabled
  restore purchases available
```

Use `$4.99/month` only if the included quota is modest.

Use `$9.99/month` if the app includes generous voice reply generation, saved audio, or frequent TTS playback.

Do not launch with unlimited usage. Unlimited AI usage creates margin risk because a small number of heavy users can exceed subscription revenue.

## Suggested Initial Quotas

Conservative launch option:

```text
Free:
  5 translation jobs/month
  5 reply audio jobs/month

Pro $4.99/month:
  100 translation jobs/month
  50 reply audio jobs/month
```

Safer margin option:

```text
Free:
  3 translation jobs/month
  3 reply audio jobs/month

Pro $4.99/month:
  60 translation jobs/month
  30 reply audio jobs/month
```

Higher-value option:

```text
Free:
  5 translation jobs/month
  5 reply audio jobs/month

Pro $9.99/month:
  250 translation jobs/month
  100 reply audio jobs/month
```

Final quotas should be based on measured average cost per completed translation and reply job.

## Required Cost Measurements

Before locking price, measure:

- Average uploaded audio duration.
- Average OpenAI STT cost per job.
- Average Modal ASR cost per job.
- Average OpenAI consolidation/translation cost per job.
- Average TTS cost per generated audio artifact.
- Average retry/failure rate.
- Average storage and bandwidth cost per saved item.

Add these fields to internal QA notes, logs, or analytics without storing sensitive transcript/audio contents:

```text
job_type
audio_duration_seconds
input_audio_bytes
provider_names
model_names
latency_ms
estimated_provider_cost_usd
status
retry_count
tts_generated
saved_to_history
```

Do not log full transcripts, generated audio bytes, private API keys, or Clerk tokens.

## RevenueCat And Server Enforcement Rule

RevenueCat should validate purchases and provide the paywall.

Convex/API should remain authoritative for access to paid AI work:

1. Mobile asks API for subscription/usage state.
2. API checks Clerk auth.
3. API checks AI consent.
4. API checks entitlement/quota.
5. Only then does API allow storage upload, Trigger dispatch, OpenAI, Modal, or TTS work.

This prevents a UI-only subscription implementation where the paywall exists but expensive backend routes remain open.

## App Store / TestFlight Sequence

Do not spend a new TestFlight build until:

1. Apple subscription product exists.
2. RevenueCat product exists or is imported.
3. Product is attached to entitlement `pro`.
4. Product is included in offering `default`.
5. RevenueCat paywall is configured.
6. Webhook URL is configured for the production API.
7. Production API has `REVENUECAT_WEBHOOK_AUTHORIZATION`.
8. Convex subscription functions are deployed.
9. API subscription gates are deployed.
10. EAS public env includes `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY`.

Then build a native iOS development or TestFlight build. RevenueCat IAP cannot be tested in Expo Go.

## Open Pricing Decision

Before creating the Apple product, choose:

```text
Monthly price: $4.99 or $9.99
Monthly translation quota:
Monthly reply audio quota:
Saved history behavior:
Yearly plan now or later:
```

Recommended default:

```text
Monthly price: $4.99
Monthly translation quota: 60
Monthly reply audio quota: 30
Saved history behavior: Pro only
Yearly plan: Later
```
