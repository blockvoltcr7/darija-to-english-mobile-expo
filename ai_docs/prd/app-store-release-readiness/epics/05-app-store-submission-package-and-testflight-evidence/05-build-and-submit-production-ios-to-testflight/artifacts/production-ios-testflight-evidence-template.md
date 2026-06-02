# Production iOS TestFlight Evidence Template

This is a template for execution-time evidence. Leave unknown fields as `TBD` until the production build/submit run actually happens.

## Execution Summary

| Field | Value |
| --- | --- |
| Date/time | TBD |
| Operator | TBD |
| Commit SHA | TBD |
| App version | TBD |
| iOS build number | TBD |
| EAS build profile | production |
| EAS environment | production |
| EAS channel | production |
| Runtime version / policy | TBD |
| Production API URL class | Verified production HTTPS / Blocked |
| Production Trigger status | Verified production deployment / Blocked |

## Static Verification

| Command | Result | Notes |
| --- | --- | --- |
| `node --check server/index.mjs` | TBD |  |
| `npm run typecheck` | TBD |  |
| `npm run lint` | TBD |  |
| `npx expo-doctor` | TBD |  |

## Build Evidence

| Field | Value |
| --- | --- |
| EAS build command | TBD |
| EAS build ID | TBD |
| EAS build URL | TBD |
| Build result | TBD |
| App Store Connect app ID | TBD |
| Upload warnings observed before/after submit | TBD |

## Submit Evidence

| Field | Value |
| --- | --- |
| Submit command | TBD |
| Submit strategy | Interactive Apple ID / App Store Connect API key / Other |
| EAS submit ID | TBD |
| Submit result | TBD |
| TestFlight processing state | TBD |
| Human-owned blockers | None / TBD |

## Redaction Check

- [ ] No Apple credentials, `.p8` contents, app-specific passwords, or Expo tokens.
- [ ] No `.env` values, API keys, Clerk session tokens, service-role keys, or provider keys.
- [ ] No private audio contents, full transcripts, generated audio bytes, or private account screenshots.
- [ ] Upload warnings and blocker notes are summarized without private account details.
