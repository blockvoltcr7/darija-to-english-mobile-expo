# Release Readiness Report Template

This is a template. Fill it only during task execution after running or reviewing the listed checks.

## Summary

- Timestamp:
- Reviewer:
- Target lane: internal preview QA | store beta with staging backend | public production release
- Recommendation: go | conditional go | no-go
- One-line rationale:

## Verification Commands

| Check | Command | Result | Evidence Location | Owner If Failed |
| --- | --- | --- | --- | --- |
| API syntax | `node --check server/index.mjs` | not run |  | API |
| Trigger syntax | `node --check trigger/translate-audio-job.mjs` | not run |  | Trigger |
| TypeScript | `npm run typecheck` | not run |  | Mobile/API |
| Lint | `npm run lint` | not run |  | Mobile/API |
| Expo doctor | `npx expo-doctor` | not run |  | Mobile/EAS |
| Staging health | `curl -sS https://darija-api-staging-nwjxqrn2ra-uc.a.run.app/health` | not run |  | API |

## Release Gates

| Gate | Status | Evidence | Notes |
| --- | --- | --- | --- |
| Staging E2E with fresh Clerk user | unknown |  | Reference prior Epic 05 artifact or fresh QA run. |
| API health and model metadata | unknown |  | Health must include OpenAI transcription, consolidation, and translation model keys. |
| Trigger execution | unknown |  | State whether this is Development local worker or deployed Trigger runtime. |
| Preview/store build status | unknown |  | Include EAS build IDs, profile, channel, and API target. |
| Store submit/TestFlight/Play testing | unknown |  | Include submit IDs or account blocker. |
| Production API path | unknown |  | Separate staging API from production API decision. |
| Rollback checklist | unknown |  | Include mobile, API, Trigger, env, and provider rollback coverage. |
| Usage controls and legal readiness | unknown |  | Public release should not pass without separate usage-control evidence. |

## Blockers

| Domain | Blocker | Evidence | Required Next Action | Owner |
| --- | --- | --- | --- | --- |
| Mobile |  |  |  |  |
| API |  |  |  |  |
| Trigger |  |  |  |  |
| Provider |  |  |  |  |
| EAS/store |  |  |  |  |
| Usage controls |  |  |  |  |

## Recommendation

Store beta:

Public release:

## Redaction Check

- [ ] No Clerk session tokens.
- [ ] No API keys or service-role keys.
- [ ] No raw `.env` values.
- [ ] No private audio contents.
- [ ] No full private transcripts.
- [ ] No provider request bodies.
