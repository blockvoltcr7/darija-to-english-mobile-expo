# Upload Warning Review Template

This is a template only. Fill it during execution with real static-check and upload-warning evidence.

## Build And Environment

| Field | Value |
| --- | --- |
| Branch |  |
| Commit SHA |  |
| EAS build profile |  |
| EAS submit profile |  |
| App version/build number |  |
| App Store Connect app ID |  |
| Date/time |  |

## Static Checks

| Command | Result | Summary |
| --- | --- | --- |
| `node --check server/index.mjs` |  |  |
| `npm run typecheck` |  |  |
| `npm run lint` |  |  |
| `npx expo-doctor` |  |  |

## Upload Warning Review

| Warning/category | Source | Exact safe summary | Decision | Owner | Follow-up |
| --- | --- | --- | --- | --- | --- |
| Privacy manifest |  |  |  |  |  |
| Required-reason API |  |  |  |  |  |
| Microphone permission |  |  |  |  |  |
| Encryption/export |  |  |  |  |  |
| Dependency/native module |  |  |  |  |  |
| Upload processing |  |  |  |  |  |

## Native Boundary Decision

| Question | Answer |
| --- | --- |
| Was any local Expo module needed? | Expected no unless blocker documented |
| Was any SwiftUI work needed? | Expected no unless blocker documented |
| Was any config plugin needed? |  |
| If yes, who approved it? |  |

## Redaction Check

- [ ] No Apple credential or `.p8` content.
- [ ] No API key or `.env` value.
- [ ] No Clerk token.
- [ ] No private audio, full transcript, or generated audio bytes.
