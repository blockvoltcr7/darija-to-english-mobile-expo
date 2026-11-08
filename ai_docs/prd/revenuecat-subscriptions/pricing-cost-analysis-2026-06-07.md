# Pricing Cost Analysis And Profit-Protected Quotas

Date prepared: 2026-06-07

Purpose: define a subscription pricing model for the iOS app that keeps usage bounded and gives the business a realistic path to profit.

This is not legal, tax, or accounting advice. It is an engineering and product cost model based on the current app architecture and public vendor pricing checked on 2026-06-07.

## Executive Recommendation

Do not sell an unlimited plan.

The current AI pipeline has real per-minute costs from OpenAI, Modal, Trigger.dev, Convex storage/egress, and Apple/RevenueCat platform fees. A profitable plan needs hard monthly quotas, maximum recording length, and backend enforcement before provider calls.

Recommended v1 pricing:

| Plan | Price | Included Usage | Max Audio Length | Notes |
| --- | ---: | --- | --- | --- |
| Free | $0 | 3 Understand minutes/month + 1 Reply audio/month | 60 seconds | Acquisition and review testing only. |
| Pro Monthly | $9.99/month | 12 Understand minutes/month + 20 Reply audio messages/month | 2 minutes | Most profit-protected launch tier. |
| Pro Plus Monthly | $14.99/month | 20 Understand minutes/month + 30 Reply audio messages/month | 2 minutes | Better if you want more generous usage while keeping risk bounded. |
| Annual | Later | Same monthly reset as monthly plan | Same limits | Add only after real cost data; avoid annual discounts until margins are measured. |

If you keep English TTS playback on every Understand result, keep the $9.99 tier at about 12 Understand minutes and 20 Reply messages. If you make English TTS optional, delayed, or counted separately, the same $9.99 plan can safely support closer to 15-20 Understand minutes.

## Core Constraint

You cannot guarantee profit with unlimited usage.

You can make loss probability much lower by enforcing:

- Monthly quotas in Convex and the Express API.
- Maximum duration per upload/recording before storage/provider work.
- No provider calls after consent withdrawal.
- No provider calls after quota exhaustion.
- No App Store copy that implies unlimited AI generation.

Current implementation risk: active `pro` entitlement bypasses free allowance checks. If that remains unchanged, Pro is effectively unlimited. Before launch, add Pro quotas and usage reservations for paid users too.

## Current Cost Map

Based on the current server defaults and pipeline:

| Flow | Provider Work |
| --- | --- |
| Understand Arabic/Darija audio | Modal Darija ASR, OpenAI transcription, OpenAI consolidation, OpenAI translation, optional OpenAI English TTS. |
| Reply in Darija | OpenAI English transcription, OpenAI Darija reply generation, OpenAI Arabic/Darija TTS. |
| Shared infrastructure | Trigger.dev worker runtime, Convex function calls/storage/egress, RevenueCat purchase tracking, Apple App Store commission. |

Current default models from `server/env.mjs`:

| Setting | Default |
| --- | --- |
| Transcription | `gpt-4o-mini-transcribe` |
| Consolidation | `gpt-5.5` |
| Translation/reply generation | `gpt-5.5` |
| TTS | `gpt-4o-mini-tts` |
| Modal ASR GPU | L4 in the reference Modal ASR app |

## Official Price Inputs

Prices were checked from official vendor pages on 2026-06-07.

| Cost Item | Public Price Used | Source |
| --- | ---: | --- |
| OpenAI `gpt-4o-mini-transcribe` | About $0.003/minute, plus token table of $1.25/1M audio input tokens and $5.00/1M output tokens | OpenAI pricing/model docs |
| OpenAI `gpt-5.5` short-context input | $5.00/1M input tokens | OpenAI pricing/model docs |
| OpenAI `gpt-5.5` short-context cached input | $0.50/1M cached input tokens | OpenAI pricing/model docs |
| OpenAI `gpt-5.5` short-context output | $30.00/1M output tokens | OpenAI pricing/model docs |
| OpenAI `gpt-4o-mini-tts` text input | $0.60/1M text input tokens | OpenAI model docs |
| OpenAI `gpt-4o-mini-tts` audio output | $12.00/1M audio output tokens | OpenAI model docs |
| Modal L4 GPU | $0.000222/second | Modal pricing |
| Trigger.dev Small 1x | $0.0000338/second + $0.000025/run | Trigger.dev pricing |
| Convex Starter variable storage/egress | File storage $0.033/GB, egress $0.132/GB after included allowance | Convex pricing |
| RevenueCat | Free up to $2,500 monthly tracked revenue, then 1% tracked revenue | RevenueCat pricing |
| Apple App Store | 70% developer proceeds standard first year; 85% after one paid service year or with Small Business Program | Apple App Store Connect docs |

## Cost Model Assumptions

These assumptions are intentionally conservative enough for launch planning, but they must be replaced with observed production metrics.

| Assumption | Value |
| --- | ---: |
| Typical Understand input | 1 minute |
| Typical Reply input | 1 minute |
| Base Modal ASR runtime | 1.5x audio duration |
| High Modal ASR runtime | 3x audio duration |
| Base Trigger runtime for Understand | 120 seconds without TTS, 135 seconds with TTS |
| Base Trigger runtime for Reply | 75 seconds |
| Misc Convex/storage/egress buffer | $0.001/job |
| TTS audio token estimate | 50 audio tokens/second |

The TTS audio-token estimate is a planning assumption. Track real usage if OpenAI returns token usage for your TTS calls, or keep a conservative fixed estimate by generated audio duration.

## Estimated Variable Cost Per Job

| Scenario | Estimated Cost | What It Means |
| --- | ---: | --- |
| Understand, low, no TTS | $0.053/job | 1 minute, faster Modal/runtime, no generated English audio. |
| Understand, base, no TTS | $0.076/job | 1 minute, expected Modal/runtime, text only. |
| Understand, base, with English TTS | $0.103/job | 1 minute, expected runtime, generated English audio. |
| Understand, high, with English TTS | $0.172/job | 1 minute, slow Modal/runtime and higher text/TTS output. |
| Reply, low | $0.027/job | 30 second English input, short Darija audio. |
| Reply, base | $0.041/job | 1 minute English input, generated Darija text and audio. |
| Reply, high | $0.079/job | 2 minute input and longer generated audio. |

Important implication: `gpt-5.5` text generation is a major cost driver for Understand because the flow uses it twice, once for consolidation and once for translation. If quality allows, a future cheaper text model for consolidation or translation could materially improve margins.

## Subscription Net Revenue

This table estimates cash available after Apple and RevenueCat. It does not include taxes, refunds, support, fixed subscriptions, or developer time.

| Price | Net At Apple 85% Minus 1% RevenueCat | Net At Apple 70% Minus 1% RevenueCat |
| ---: | ---: | ---: |
| $4.99 | About $4.19 | About $3.44 |
| $9.99 | About $8.39 | About $6.89 |
| $14.99 | About $12.59 | About $10.34 |

Planning rule: keep variable AI cost near or below 30% of net subscription revenue at launch. This leaves room for fixed costs, failed/retried jobs, refunds, support, and future price increases by providers.

## Quota Math

Using base costs:

- Understand with English TTS: about $0.103 per included minute.
- Understand without English TTS: about $0.076 per included minute.
- Reply audio: about $0.041 per included message.

### $9.99 Pro Monthly

At standard Apple proceeds, estimated net is about $6.89. A 30% variable-cost budget is about $2.07.

| Quota Mix | Estimated Variable Cost | Margin Read |
| --- | ---: | --- |
| 12 Understand minutes with TTS + 20 Reply messages | $2.06 | Fits about 30% of standard first-year net. |
| 15 Understand minutes with TTS + 20 Reply messages | $2.37 | Better if Apple Small Business proceeds apply; slightly aggressive at standard proceeds. |
| 20 Understand minutes without TTS + 20 Reply messages | $2.34 | Works if English TTS is optional or counted separately. |

Recommended $9.99 launch quota: 12 Understand minutes/month + 20 Reply audio messages/month.

### $14.99 Pro Plus Monthly

At standard Apple proceeds, estimated net is about $10.34. A 30% variable-cost budget is about $3.10.

| Quota Mix | Estimated Variable Cost | Margin Read |
| --- | ---: | --- |
| 20 Understand minutes with TTS + 30 Reply messages | $3.30 | Slightly above 30% standard net; reasonable if Apple Small Business applies. |
| 18 Understand minutes with TTS + 30 Reply messages | $3.09 | Fits about 30% standard net. |
| 25 Understand minutes without TTS + 30 Reply messages | $3.13 | Reasonable if English TTS is optional or separately metered. |

Recommended $14.99 launch quota: 20 Understand minutes/month + 30 Reply audio messages/month if enrolled in Apple Small Business Program; otherwise use 18 Understand minutes/month.

## Why Not $4.99

At $4.99, standard first-year App Store net is about $3.44. A 30% variable-cost budget is about $1.03.

That only supports roughly:

- 10 one-minute Understand jobs with English TTS, or
- 13 one-minute Understand jobs without English TTS, or
- 25 Reply audio jobs, before fixed costs and retries.

Use $4.99 only for a small starter plan, not for a plan that feels like a full translation subscription.

## Product Copy Guidance

Use bounded language:

- "Includes 12 translation minutes per month."
- "Includes 20 Darija reply audio messages per month."
- "Maximum 2 minutes per recording."
- "Unused monthly allowance does not roll over."
- "AI results may be inaccurate."

Avoid:

- "Unlimited translations."
- "Unlimited voice replies."
- "Always available."
- "Guaranteed accurate."
- "Stores everything forever."

## Production Blockers Before Charging

1. Add Pro quotas.

   Current active `pro` users bypass free usage limits. Add paid-plan usage periods and reservations so every provider call is bounded.

2. Enforce max audio duration before paid work.

   Reject or trim over-limit uploads before Modal/OpenAI/Trigger work. A file-size cap is not enough because compressed audio can be long.

3. Meter by minutes, not only job count.

   Job counts are easier, but minutes are safer. If v1 keeps job counts, enforce a strict max duration per job.

4. Track estimated cost metadata.

   Store metadata only, not user content. Suggested fields:

   - `audioDurationSeconds`
   - `flow`
   - `modelsUsed`
   - `modalRuntimeSeconds`
   - `triggerRuntimeSeconds`
   - `openAiInputTokens`
   - `openAiOutputTokens`
   - `ttsAudioSeconds`
   - `generatedAudioBytes`
   - `retryCount`
   - `estimatedCostUsd`

5. Make paywall copy match App Store metadata.

   The subscription description, RevenueCat paywall, App Store product text, and in-app Account screen should say the same quota and renewal rules.

6. Keep consent withdrawal above subscription access.

   A paying user who withdraws AI consent must still be blocked from new AI processing.

## Recommended Launch Sequence

1. Ship RevenueCat with a free allowance and hidden/internal Pro gate.
2. Add Pro quota enforcement in Convex and the Express API.
3. Add audio duration measurement before uploads are accepted for paid processing.
4. Add usage and estimated-cost metadata.
5. Run 100-500 real test jobs across common audio lengths.
6. Recalculate p50, p90, and p95 cost per Understand minute and Reply message.
7. Only then finalize $9.99 versus $14.99 as the primary public plan.

## Source Links

- OpenAI pricing: https://developers.openai.com/api/docs/pricing
- OpenAI `gpt-4o-mini-transcribe`: https://developers.openai.com/api/docs/models/gpt-4o-mini-transcribe
- OpenAI `gpt-5.5`: https://developers.openai.com/api/docs/models/gpt-5.5
- OpenAI `gpt-4o-mini-tts`: https://developers.openai.com/api/docs/models/gpt-4o-mini-tts
- OpenAI text-to-speech guide: https://developers.openai.com/api/docs/guides/text-to-speech
- Modal pricing: https://modal.com/pricing
- Trigger.dev pricing: https://trigger.dev/pricing
- Convex pricing: https://www.convex.dev/pricing
- RevenueCat pricing: https://www.revenuecat.com/pricing/
- Apple auto-renewable subscriptions: https://developer.apple.com/help/app-store-connect/manage-subscriptions/offer-auto-renewable-subscriptions
- Apple Small Business Program: https://developer.apple.com/app-store/small-business-program/
