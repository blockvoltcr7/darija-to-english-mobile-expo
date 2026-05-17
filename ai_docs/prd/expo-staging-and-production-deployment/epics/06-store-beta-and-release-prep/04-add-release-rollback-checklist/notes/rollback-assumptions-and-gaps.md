# Rollback Assumptions And Gaps

## Assumptions

- `ai_docs/deployment/release-checklist.md` is an internal operator document, not user-facing release notes.
- Store beta and production release remain gated by staging E2E evidence and usage-control readiness.
- Mobile builds, EAS Update, API hosting, and Trigger.dev are separate rollback surfaces; a rollback in one layer may not fix another.
- Current production API deployment can be documented as deferred, but production mobile builds should not be treated as ready without a production API URL decision.
- Trigger.dev paid Staging/Preview environments remain deferred; current verified QA uses Trigger.dev Development with a local worker.

## Fast Rollback Boundaries

| Surface | Fast rollback available? | Notes |
| --- | --- | --- |
| EAS Update JavaScript bundle | Yes, if runtime-compatible | Use `eas update:rollback` or publish a targeted hotfix to the intended channel/branch. |
| Native mobile binary | Limited | Store rollback depends on App Store Connect or Google Play options; native fixes usually require a new build/submission. |
| API host | Yes for Cloud Run revisions | Route traffic to a known-good revision, then re-run `/health` and an authenticated smoke path. |
| Trigger worker | Yes for deployed versions; limited for active runs | New runs use the current deployment after rollback; already-started runs may need cancel/replay. |
| Mobile public env baked into build | No quick in-place fix | Requires a new build or an EAS Update only if the app reads the corrected value from JS and the runtime is compatible. |
| Server secret/env mistake | Usually yes | Update secret/env source, redeploy/restart the owning service, and verify sanitized health/log output. |

## Gaps To Keep Visible

- No production API URL is committed in the runbooks yet.
- No Trigger.dev production deployment evidence exists in the current docs.
- The current upload contract still uses base64 JSON audio and has known hosted request-size risk.
- Usage controls are a separate Epic 04 dependency; wider beta/public release should wait until cost and abuse controls are verified.
- Store account access and submission status may still block TestFlight or Google Play testing.
- If an EAS Update changes code that depends on native configuration, package additions, permissions, or app config changes, a new binary may be required instead of rollback/update-only recovery.
