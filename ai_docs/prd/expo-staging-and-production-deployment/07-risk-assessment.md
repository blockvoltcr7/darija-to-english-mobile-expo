# 07 — Risk Assessment

## High Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Preview/staging build points to `localhost` | Physical phone cannot reach API; all uploads fail before backend. | Set `EXPO_PUBLIC_API_BASE_URL` through EAS env and verify diagnostics before E2E QA. |
| Secrets leak into mobile public env | OpenAI, Modal, Supabase service role, or Clerk secret could be exposed in the app bundle. | Explicitly audit EAS env variables; only `EXPO_PUBLIC_*` values go to mobile, and provider keys stay on API/Trigger hosts. |
| Trigger worker not deployed or not connected | API queues jobs, but translations stay `queued`. | Deploy Trigger staging worker and make Trigger success a required QA artifact. |

## Medium Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| API host request/body limits reject base64 audio | Uploads fail for realistic `.m4a` files. | Select host with adequate body-size support or add direct-to-storage upload design before production. |
| Runtime mismatch on API host | Express or package behavior differs from local Node. | Use a Node host that matches project runtime; run `/health` and a real translation job after deploy. |
| iOS internal distribution setup delays QA | Device UDID/provisioning blocks install. | Register device early; use TestFlight if internal distribution becomes slow. |
| Production and staging share unsafe resources | Test jobs pollute production data or spend. | Use separate env variables, buckets/prefixes, Trigger envs, and Clerk test/prod keys where possible. |
| Modal or OpenAI provider failures are hard to diagnose | E2E fails without clear owner. | Require trace IDs, provider run logs, and Trigger run IDs in staging QA notes. |

## Low Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| EAS Update channel misuse | JS updates could target wrong audience. | Define channels in `eas.json`; only use EAS Update after preview/staging/production channels are confirmed. |
| Documentation drift | Future implementers run stale commands. | Keep `ai_docs/deployment/` runbooks updated whenever EAS/API host config changes. |
| Android staging lags iOS | Android release-readiness remains unknown. | Track Android preview/test build as separate acceptance item before public Android release. |

## Risk Acceptance

The first implementation should accept that API hosting is separate from Expo native deployment. This is less elegant than a single platform, but it avoids an unnecessary backend refactor while the app is still moving toward beta readiness.
