# Submit Config Review Template

This is a template for future execution evidence. Do not fill it with guessed values.

## Summary

- Date:
- Reviewer:
- Result: configured / blocked / partially configured
- Platforms reviewed: iOS / Android
- Submit profile reviewed: staging / production

## Local Config Snapshot

- `eas.json` submit profiles present:
- `staging` build profile environment:
- `staging` build profile channel:
- `production` build profile environment:
- iOS bundle identifier:
- iOS Apple Team ID:
- Android package:
- EAS project ID:

## iOS Status

- App Store Connect app record: verified / missing / unknown
- `ascAppId`: recorded in config / known but not committed / unknown
- Submit credential strategy: EAS-managed API key / local API key path / app-specific password / interactive / undecided
- TestFlight submit attempted: yes / no
- Sanitized submission ID or build ID:
- Blocker:

## Android Status

- Google Play app record: verified / missing / unknown
- Service account key in EAS credentials: verified / missing / unknown
- First manual upload completed: yes / no / unknown
- Target track:
- Google Play submit attempted: yes / no
- Sanitized submission ID or build ID:
- Blocker:

## Redaction Check

- [ ] No Expo tokens
- [ ] No Apple passwords, verification codes, session values, or `.p8` contents
- [ ] No Google service-account JSON contents
- [ ] No private account screenshots
- [ ] No production release claim unless public release was explicitly in scope
