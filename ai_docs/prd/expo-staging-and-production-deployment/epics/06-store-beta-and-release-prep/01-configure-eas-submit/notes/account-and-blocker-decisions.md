# Account And Blocker Decisions

## Current Task Position

This task can safely verify local submit placeholders and document account requirements. It should not claim EAS Submit is configured unless account-owned App Store Connect and Google Play prerequisites are actually completed.

2026-05-17 review outcome: local `eas.json` and `app.json` are compatible with store-beta preparation, but EAS Submit is not configured because store account access, app records, `ascAppId`, Google Play service-account setup, and first-upload status are not locally verified.

## Decisions To Make During Execution

- Whether `submit.staging` should include both `ios` and `android` blocks immediately, or only the platform that has verified portal access. Current recommendation: keep placeholders empty until at least one platform has verified portal access and a chosen credential strategy.
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
- Deployment docs have a small identity drift: `ai_docs/deployment/README.md` says `expo.owner`, `expo.runtimeVersion`, and `expo.extra.eas.projectId` are absent, but `app.json` contains them.

## Redaction Rules

Do not write these into notes or artifacts:

- Expo access tokens
- Apple ID passwords, app-specific passwords, session values, or verification codes
- App Store Connect `.p8` contents
- Google service-account JSON contents
- Private account email addresses unless the user explicitly approves sanitized use
