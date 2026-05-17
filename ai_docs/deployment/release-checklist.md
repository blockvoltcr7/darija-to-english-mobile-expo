# Release And Rollback Checklist

This is the operator checklist for internal QA, store beta, and future production release. It separates mobile build rollout from API hosting, Trigger.dev workers, provider health, and human-owned store actions.

Status on 2026-05-17:

- Internal development QA: passed in Epic 05 on a physical iPhone.
- Store beta: blocked on human-owned App Store Connect / Google Play setup and a release-owner decision about staging-backed runtime.
- Public production release: no-go until production API, production Trigger, usage controls, legal/privacy, and account-deletion gates are complete.

## Source Evidence

Use sanitized evidence only:

- Epic 05 evidence: `ai_docs/prd/expo-staging-and-production-deployment/epics/05-staging-e2e-qa/05-capture-staging-qa-evidence/artifacts/staging-e2e-qa-evidence.md`
- Store beta execution review: `ai_docs/prd/expo-staging-and-production-deployment/epics/06-store-beta-and-release-prep/02-create-store-beta-builds/artifacts/store-beta-execution-review-2026-05-17.md`
- Production API path: `ai_docs/deployment/production-api.md`
- API hosting runbook: `ai_docs/deployment/api-hosting.md`
- Trigger runtime runbook: `ai_docs/deployment/triggerdev.md`

Do not paste Clerk session tokens, `.env` values, provider keys, private audio, full transcripts, Apple credentials, Google service-account JSON, or private account screenshots into release evidence.

## Pre-Release Gates

| Gate | Store beta requirement | Public release requirement |
| --- | --- | --- |
| Git state | Release commit SHA recorded with `git rev-parse HEAD`. | Same, plus signed-off release tag or equivalent release record. |
| App identity | `app.json` identity unchanged: `Darija to English`, bundle/package `com.samisabiridrissi.darijatoenglish`. | Same. |
| EAS lane | `staging` build profile, `staging` channel, EAS `preview` environment documented. | `production` build profile, `production` channel, EAS `production` environment. |
| API target | Non-local HTTPS API. Staging-backed beta must be explicitly labeled. | Verified production HTTPS API in `EXPO_PUBLIC_API_BASE_URL`. |
| Clerk | Fresh sign-up/sign-in evidence exists. | Production Clerk keys/webhooks and account-deletion path verified. |
| Supabase/storage | History and private storage worked in Epic 05. | Production Supabase/storage isolation and RLS reviewed. |
| Trigger.dev | Development worker path documented for no-paid beta. | Production Trigger deployment verified; local worker dependency removed. |
| Providers | OpenAI and Modal succeeded in Epic 05 evidence. | Production provider keys/projects, quotas, and monitoring owner decided. |
| Usage controls | Required before wider beta/public release. | Required. |
| Legal/privacy | Not required for owner-only internal QA. | Privacy policy, data handling, and deletion support required before public release. |

## Release Steps

1. Record the release candidate commit:

```bash
git rev-parse HEAD
```

2. Confirm EAS lane and app identity:

```bash
npx eas-cli@latest whoami
npx eas-cli@latest config --profile staging --platform ios --non-interactive
npx eas-cli@latest config --profile staging --platform android --non-interactive
```

Do not paste public key values from config output into docs. Record only profile, channel, environment, bundle/package ID, and API URL class.

3. Verify API health for the selected lane:

```bash
curl -sS https://darija-api-staging-nwjxqrn2ra-uc.a.run.app/health
```

For production, replace the URL with the verified production API URL from `ai_docs/deployment/production-api.md`.

4. Verify Trigger runtime:

```bash
npm run trigger:dev -- --env-file .env.local --skip-update-check
```

For production, use the production deployment path only after production API/secrets are approved:

```bash
npm run trigger:deploy:prod
```

5. Build store beta only when the human account owner is present:

```bash
npx eas-cli@latest build -p ios --profile staging
npx eas-cli@latest build -p android --profile staging
```

6. Submit only after store account prerequisites are confirmed:

```bash
npx eas-cli@latest submit -p ios --profile staging --latest
npx eas-cli@latest submit -p android --profile staging --latest
```

7. Capture sanitized beta evidence:

- EAS build ID and URL.
- Submit ID or store processing URL if present.
- Build profile, EAS environment, channel, app version, and bundle/package ID.
- API target class: non-local HTTPS staging or production.
- Job ID and Trigger run ID for one successful authenticated translation test.
- Final job status and provider status names only, not full private transcript/audio.

## Rollback Decision Tree

| Problem surface | Fast rollback | When a new binary is required |
| --- | --- | --- |
| JavaScript-only bug | `eas update:rollback` or publish a targeted hotfix to the affected channel. | If the fix needs native dependency, permission, app config, runtime-version, or identity changes. |
| Wrong mobile public env baked into binary | Sometimes via compatible JS update, if runtime reads corrected value from JS. | Usually required if the binary was built with the wrong API URL or native config. |
| Native crash or permission issue | Stop rollout in TestFlight/Play if possible. | Required. Build and submit a fixed binary. |
| Cloud Run API regression | Route traffic to known-good revision. | Not a mobile binary issue unless the app also shipped wrong API assumptions. |
| Trigger worker regression | Roll back Trigger deployment for new runs; cancel/replay bad active runs if needed. | Not a mobile binary issue unless app behavior must change. |
| Provider outage | Pause rollout, classify provider, avoid repeated paid retries. | Usually not required unless app needs a fallback UX shipped. |

## Rollback Commands

EAS Update rollback:

```bash
eas update:rollback
```

Targeted EAS hotfix:

```bash
eas update --channel <preview|staging|production> --message "<sanitized hotfix summary>"
```

Cloud Run rollback:

```bash
gcloud run revisions list \
  --service <api-service-name> \
  --region <region>

gcloud run services update-traffic <api-service-name> \
  --region <region> \
  --to-revisions <known-good-revision>=100
```

Trigger local recovery path:

```bash
npm run trigger:dev -- --env-file .env.local --skip-update-check
```

Trigger production rollback is human-owned in the Trigger.dev dashboard until production deployment evidence exists in this repo. Record the previous and restored deployment versions without secret values.

## Post-Release Verification

After any release or rollback:

- Re-run `/health` for the selected API URL.
- Submit one authenticated translation job from the intended build.
- Record sanitized `jobId`, `triggerRunId`, API URL class, timestamp, and terminal status.
- Confirm history shows the completed result for the signed-in user.
- Confirm failed or queued jobs do not remain indefinite without a visible error.
- Confirm no local URL warning appears in the mobile diagnostics panel.

## Human Review Points

The following remain human-owned and must not be treated as automated success:

- Apple Developer agreements, 2FA, app record, TestFlight groups, and Beta App Review.
- Google Play Console app setup, service-account authorization, first upload, and tester tracks.
- Production Cloud Run/Supabase/Clerk/Trigger/Modal/OpenAI resource choices.
- Decision to allow a staging-backed store beta.
- Wider beta tester invitations.
- Public App Store or Play Store release approval.

## No-Go Rules

- Do not ship public release while production API is deferred.
- Do not invite wider beta testers while Trigger completion depends on a local Development worker unless the release owner explicitly accepts that limitation.
- Do not use production EAS public env until the production HTTPS API target is chosen and verified.
- Do not rely on EAS Update rollback for native/runtime/config changes.
- Do not mark public release ready until usage controls, privacy/legal, and account deletion are verified.
