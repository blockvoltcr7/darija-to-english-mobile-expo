# RevenueCat Subscriptions

## Summary

Darija to English uses RevenueCat for the first iOS subscription path. Purchases are Apple In-App Purchase subscriptions, RevenueCat handles StoreKit/customer state, Convex stores the app's entitlement and usage state, and the Express API gates paid AI work before storage, Trigger.dev, OpenAI, Modal, or TTS calls.

V1 product model:

- Free users receive a small monthly allowance for `translation` and `response_audio`.
- Pro users unlock higher-use access and saved history.
- Saved history is Pro-only in V1.
- Stripe or external web checkout is out of scope for the iOS app purchase path.

Pricing and quota source of truth:

- Use `pricing-cost-analysis-2026-06-07.md` before creating App Store products or paywall copy.
- Do not launch with unlimited Pro usage. Paid users still need server-enforced monthly quotas and maximum recording duration.
- The profit-protected v1 recommendation is $9.99/month with 12 Understand minutes/month and 20 Reply audio messages/month, or $14.99/month with about 18-20 Understand minutes/month and 30 Reply audio messages/month.

## Official References

- RevenueCat Expo installation: https://www.revenuecat.com/docs/getting-started/installation/expo
- RevenueCat Paywalls: https://www.revenuecat.com/docs/tools/paywalls
- RevenueCat webhooks: https://www.revenuecat.com/docs/integrations/webhooks
- RevenueCat MCP setup: https://www.revenuecat.com/docs/tools/mcp/setup
- Expo In-App Purchases guide: https://docs.expo.dev/guides/in-app-purchases/
- Apple App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- App Store auto-renewable subscriptions: https://developer.apple.com/help/app-store-connect/manage-subscriptions/offer-auto-renewable-subscriptions/

## Setup Checklist

1. Create App Store Connect subscription group for Darija to English.
2. Add auto-renewable products, recommended identifiers:
   - `darija_pro_monthly`
   - `darija_pro_yearly`
3. Create RevenueCat project and iOS app using bundle id `com.samisabiridrissi.darijatoenglish`.
4. Connect RevenueCat to App Store Connect.
5. Add the products in RevenueCat.
6. Create entitlement `pro`.
7. Attach monthly/yearly products to `pro`.
8. Create the default offering and RevenueCat Paywall.
9. Configure webhook URL:
   - `https://<api-host>/v1/webhooks/revenuecat`
10. Configure webhook authorization header value and set the same value as `REVENUECAT_WEBHOOK_AUTHORIZATION` on the API.
11. Add RevenueCat MCP for Codex:
   - `codex mcp add revenuecat --url https://mcp.revenuecat.ai/mcp`

## Environment Contract

Mobile-safe public values:

```bash
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_...
EXPO_PUBLIC_REVENUECAT_PRO_ENTITLEMENT=pro
```

Server-only values:

```bash
REVENUECAT_WEBHOOK_AUTHORIZATION=<random shared webhook value>
REVENUECAT_SECRET_API_KEY=<optional RevenueCat secret API key>
FREE_TRANSLATION_JOBS_PER_MONTH=5
FREE_RESPONSE_AUDIO_JOBS_PER_MONTH=5
```

Notes:

- Do not use `EXPO_PUBLIC_*` for RevenueCat webhook authorization or secret API keys.
- Webhook sync is required for production entitlement enforcement.
- `REVENUECAT_SECRET_API_KEY` is optional and only enables server-side customer refresh. If it is absent, the API returns current Convex state and relies on webhooks.

## Runtime Design

- Mobile initializes RevenueCat after Clerk sign-in using Clerk `user.id` as the RevenueCat App User ID.
- Mobile uses RevenueCat UI for paywall and restore purchases.
- Express exposes:
  - `GET /v1/me/subscription`
  - `POST /v1/me/subscription/sync`
  - `POST /v1/webhooks/revenuecat`
- Convex stores:
  - RevenueCat customer mapping.
  - Current `pro` entitlement state.
  - Processed webhook event ids for idempotency.
  - Monthly usage periods and usage reservations.
- API gates run after Clerk and consent, before paid work:
  - `POST /v1/translations`
  - `POST /v1/response-audio`
  - legacy translate aliases
  - `POST /v1/translations/:id/save`

## App Store Review Notes

- The app sells access to digital AI translation/reply features, so iOS purchases use Apple IAP.
- Restore Purchases is available from Account.
- The paywall uses RevenueCat's native purchase UI in V1.
- Reviewers need a test account and sandbox subscription instructions.
- Do not add external Stripe/web checkout CTAs to the iOS app without a separate App Review/legal review.

## QA Checklist

1. Build a new EAS development/TestFlight build after installing RevenueCat native packages.
2. Sign in with a Clerk test user.
3. Confirm Account shows Free plan before purchase.
4. Use free translation/reply allowance.
5. Exhaust allowance and confirm the RevenueCat paywall opens.
6. Complete sandbox subscription purchase.
7. Confirm Account shows Pro active after webhook sync.
8. Confirm Pro user can translate, create reply audio, and save to history.
9. Confirm Restore Purchases updates RevenueCat state and server state.
10. Confirm revoked AI consent still blocks processing even with Pro active.
