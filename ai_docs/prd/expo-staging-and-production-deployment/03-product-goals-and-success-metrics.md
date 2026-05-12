# 03 — Product Goals And Success Metrics

## Goals

1. Provide a repeatable EAS build system for development, preview, staging, and production app builds.
2. Make the app installable on a physical iPhone before public release.
3. Ensure every non-local build uses a reachable HTTPS API URL.
4. Deploy the existing Express API without exposing provider secrets to the mobile client.
5. Deploy the Trigger.dev worker so async translations complete outside local development.
6. Support fresh Clerk user QA against staging infrastructure.
7. Produce enough logs and runbook documentation to trace one translation from phone upload to final translated result.

## Success Metrics

| Metric | Target | How To Verify |
| --- | --- | --- |
| EAS profiles exist | `development`, `preview`, `staging`, and `production` profiles are present. | Inspect `eas.json`. |
| Preview install works | A preview build installs on a physical iPhone through EAS internal distribution or TestFlight. | Install on device and capture build URL / TestFlight status. |
| API URL is non-local in preview | Preview build uses `https://...` API base URL. | Check app diagnostics and API logs; no `localhost:8787` in device build. |
| API health works | Staging API returns expected health shape. | `curl https://<staging-api>/health` includes configured dependencies and models. |
| Trigger worker runs | Staging Trigger run reaches success. | Trigger dashboard shows run success for uploaded audio job. |
| Fresh user isolation works | New Clerk test user does not see previous user rows. | Sign out, sign up, open History, verify rows are user-scoped. |
| Audio E2E completes | Upload from physical phone reaches `succeeded`. | App shows English translation, consolidated Darija, raw STT outputs, and model metadata. |
| Secrets remain server-side | No provider keys are added to Expo public env. | Inspect EAS env list and app code; only public values use `EXPO_PUBLIC_`. |
| Release runbook exists | Staging and production deployment commands are documented. | New docs page exists and references exact commands. |

## Non-Goals

- Do not optimize cost controls in this PRD. That belongs to Epic 04 / usage controls.
- Do not add direct mobile-to-Supabase access.
- Do not change provider model selection unless required for deployment compatibility.
