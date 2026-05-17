# Release Readiness Report - 2026-05-17

## Summary

- Reviewer: Codex
- Commit under review before final Phase 4 commit: `ec3c39c3d877f70f79dd41303a680f1942ea66e3`
- Target lane: Epic 06 store beta and release prep.
- Recommendation:
  - Internal development QA: go.
  - Store beta: conditional no-go until human store setup is completed and staging-backed runtime is explicitly accepted.
  - Wider external beta: no-go until store beta install/runtime evidence exists and usage controls are verified.
  - Public production release: no-go.

One-line rationale: the app and staging API pass technical checks, but store distribution and production release are gated by human-owned Apple/Google setup, production API/Trigger decisions, and usage-control/legal readiness.

## Verification Commands

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| API syntax | `node --check server/index.mjs` | passed | no syntax output |
| Trigger syntax | `node --check trigger/translate-audio-job.mjs` | passed | no syntax output |
| TypeScript | `npm run typecheck` | passed | `tsc --noEmit` exited 0 |
| Lint | `npm run lint` | passed | `expo lint` exited 0 |
| Expo Doctor | `npx expo-doctor` | passed | `18/18 checks passed. No issues detected!` |
| Staging API health | `curl -sS https://darija-api-staging-nwjxqrn2ra-uc.a.run.app/health` | passed | `ok: true`; dependencies true; model keys present |

Staging `/health` returned:

```json
{
  "ok": true,
  "service": "darija-to-english-api",
  "dependencies": {
    "clerk": true,
    "darija_asr": true,
    "openai": true,
    "supabase": true
  },
  "models": {
    "openai_transcription": "gpt-4o-mini-transcribe",
    "consolidation": "gpt-5.5",
    "translation": "gpt-5.5"
  }
}
```

## Current Config Snapshot

| Area | Current value |
| --- | --- |
| EAS owner | `blockvoltcr7` |
| EAS project ID | `70c597ff-6021-4069-bb43-9c301ac4baa2` |
| iOS bundle ID | `com.samisabiridrissi.darijatoenglish` |
| Android package | `com.samisabiridrissi.darijatoenglish` |
| Runtime version | `appVersion` policy |
| Store beta build profile | `staging` |
| Store beta EAS environment | `preview` |
| Store beta channel | `staging` |
| Production build profile | `production` |
| Production channel | `production` |
| Submit profiles | `staging`, `production` placeholders |

## Release Gates

| Gate | Status | Evidence | Notes |
| --- | --- | --- | --- |
| Fresh Clerk auth and real-phone E2E | passed | Epic 05 evidence artifact, timestamp `2026-05-16T21:27:37Z` | User confirmed sign-up/sign-in, upload, microphone recording, translation, and history. |
| API health and model metadata | passed | Staging `/health` check in this report | Health proves config shape, not a paid provider run. |
| Trigger execution | conditional | Epic 05 evidence | Verified path is Trigger.dev Development worker via `npm run trigger:dev -- --env-file .env.local --skip-update-check`; hosted production Trigger is not verified. |
| Preview/device build status | passed | Epic 05 evidence | Physical iPhone preview build `32823c20-98fe-46ea-bed9-991f4b38ff27` worked. |
| Store beta build/submit | blocked | Task 02 execution review | iOS and Android blocked on human-owned App Store Connect / Google Play setup and runtime decision. |
| Production API path | deferred | `ai_docs/deployment/production-api.md` | Production mobile builds no-go until production HTTPS API target is chosen and verified. |
| Rollback checklist | passed for documentation | `ai_docs/deployment/release-checklist.md` | Portal-only rollback actions remain human-owned until real store uploads exist. |
| Usage controls/legal/account deletion | blocked for public/wider beta | Separate release-readiness dependency | Public release should not pass without usage controls, privacy/legal, retention, and account deletion evidence. |

## Blockers By Domain

| Domain | Blocker | Required next action | Owner |
| --- | --- | --- | --- |
| EAS/store | App Store Connect app record/TestFlight path is not verified. | Human signs in, confirms or creates app record, handles 2FA/agreements, and runs build/submit with Codex support. | Human account owner |
| EAS/store | Google Play app/package ownership and service-account setup are not verified. | Human confirms Play app setup, testing track, and service-account or interactive submit path. | Human account owner |
| Trigger | Store beta currently relies on Development-worker knowledge unless a hosted runtime is chosen. | Decide whether staging-backed beta may depend on a running Development worker, or deploy a reachable Trigger runtime. | Release/runtime owner |
| API | Production API is deferred. | Create/verify production HTTPS API or explicitly approve staging-backed store beta. | Infrastructure owner |
| Usage controls | Wider beta/public release controls are not verified in this report. | Verify usage ledger, rate limit/reservation, kill switch, retention cleanup, and account deletion/legal docs. | Product/engineering owner |
| Legal/privacy | Public store readiness is incomplete. | Add privacy policy, deletion support, retention statement, and store metadata review before public release. | Release owner |

## Verdicts

| Lane | Verdict | Reason |
| --- | --- | --- |
| Internal development QA | Go | Real-phone Epic 05 evidence passed, static checks passed, staging API health passed. |
| Store beta with staging backend | Conditional no-go | Technically prepared, but no TestFlight/Play build or submit evidence exists; human store setup and runtime acceptance are required. |
| Wider external beta | No-go | Needs store beta install evidence, hosted runtime decision, usage controls, and tester/audience approval. |
| Public production release | No-go | Production API/Trigger are deferred; usage controls, privacy/legal, account deletion, and store release approvals are incomplete. |

## Redaction Check

- No Clerk session tokens included.
- No API keys or service-role keys included.
- No raw `.env` values included.
- No private audio contents included.
- No full private transcripts included.
- No provider request bodies included.
- No Apple or Google credential material included.
