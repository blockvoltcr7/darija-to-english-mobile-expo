# Privacy Manifest Upload Warning Checklist

Use this during execution when a release binary is ready.

## Static Checks

Run project-standard checks after code/config changes:

```bash
node --check server/index.mjs
npm run typecheck
npm run lint
npx expo-doctor
```

Record only summaries and failures. Do not paste secrets or private env output.

## Build/Upload Warning Review

When the iOS binary is built/uploaded through the approved profile:

- [ ] Review EAS build output for iOS config, dependency, and upload warnings.
- [ ] Review App Store Connect/TestFlight processing status.
- [ ] Review Apple emails for privacy manifest, required-reason API, permission, encryption/export, or dependency warnings.
- [ ] Check whether `expo-audio` microphone permission text is included in the binary.
- [ ] Check whether `ITSAppUsesNonExemptEncryption=false` remains consistent with the Epic 00 decision.
- [ ] Check whether any warning changes App Store privacy-label answers.

## Warning Classification

| Warning/category | Source | Decision | Owner | Blocks Epic 05? |
| --- | --- | --- | --- | --- |
| Privacy manifest |  |  |  |  |
| Required-reason API |  |  |  |  |
| Microphone permission |  |  |  |  |
| Encryption/export |  |  |  |  |
| Dependency/native module |  |  |  |  |
| Upload processing |  |  |  |  |

Decision values:

- `Resolved with change`
- `Accepted with rationale`
- `Blocker`
- `Not applicable`

## Redaction Rules

- Do not include Apple credentials, `.p8` contents, API keys, `.env` values, Clerk tokens, private audio, full transcripts, or generated audio bytes.
- Sanitized warning categories and non-secret file paths are acceptable.
