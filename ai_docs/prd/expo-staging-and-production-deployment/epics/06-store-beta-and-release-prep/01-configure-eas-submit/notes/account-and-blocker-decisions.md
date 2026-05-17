# Account And Blocker Decisions

## Current Task Position

This task can safely verify local submit placeholders and document account requirements. It should not claim EAS Submit is configured unless account-owned App Store Connect and Google Play prerequisites are actually completed.

## Decisions To Make During Execution

- Whether `submit.staging` should include both `ios` and `android` blocks immediately, or only the platform that has verified portal access.
- Whether the iOS path will use an App Store Connect API key in EAS credentials, an app-specific password, or an interactive owner-run submit.
- Whether Android store beta targets `internal`, `alpha`, or `beta`; default recommendation is `internal` for first store-beta validation.
- Whether Google service-account credentials live only in EAS remote credentials or are referenced by a local path outside source control.

## Known Blocker Classes

- Expo account lacks access to the EAS project.
- Apple account cannot access team `57JWLP426D`.
- App Store Connect app record is missing or `ascAppId` is unknown.
- App Store Connect API key or app-specific password is not configured.
- Google Play app record for `com.samisabiridrissi.darijatoenglish` is missing.
- Google Service Account key is missing from EAS credentials.
- Google Play first manual upload has not happened yet.
- Production API URL is not ready, so production submit configuration must remain deferred.

## Redaction Rules

Do not write these into notes or artifacts:

- Expo access tokens
- Apple ID passwords, app-specific passwords, session values, or verification codes
- App Store Connect `.p8` contents
- Google service-account JSON contents
- Private account email addresses unless the user explicitly approves sanitized use
