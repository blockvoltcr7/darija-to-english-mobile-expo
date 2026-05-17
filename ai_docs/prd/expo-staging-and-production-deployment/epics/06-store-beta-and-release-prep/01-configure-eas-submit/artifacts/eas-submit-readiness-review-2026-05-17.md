# EAS Submit Readiness Review - 2026-05-17

## Summary

- Result: blocked on human-owned store account setup; local source config is ready to keep placeholder submit profiles until store records and credentials are confirmed.
- Platforms reviewed: iOS and Android.
- Submit profiles reviewed: `staging` and `production`.
- EAS CLI inspection: `npx eas-cli@latest --version` returned `eas-cli/18.13.0 darwin-arm64 node-v22.17.1`.
- Interactive submit/configure commands run: none. This review intentionally stopped before App Store Connect, Google Play Console, credential, app-record, or 2FA prompts.

## Local Config Snapshot

Source files inspected: `eas.json`, `app.json`, `ai_docs/deployment/README.md`, `ai_docs/prd/expo-staging-and-production-deployment/05-technical-specifications.md`, and `ai_docs/prd/expo-staging-and-production-deployment/06-implementation-phases.md`.

| Item | Current value | Readiness note |
| --- | --- | --- |
| `submit.staging` | `{}` | Valid placeholder until App Store Connect / Google Play setup decisions are confirmed. |
| `submit.production` | `{}` | Valid placeholder; production lane should stay deferred until production API URL and store credentials are ready. |
| `build.staging.distribution` | `store` | Correct shape for TestFlight / Google Play testing. |
| `build.staging.environment` | `preview` | Expected current state because custom EAS staging environments are plan-gated. |
| `build.staging.channel` | `staging` | Correct release-candidate channel separation. |
| `build.production.environment` | `production` | Correct production lane separation, but production public env/API readiness is not proven in this task. |
| `build.production.channel` | `production` | Correct production update channel. |
| iOS bundle ID | `com.samisabiridrissi.darijatoenglish` | Must remain unchanged for App Store Connect app record matching. |
| iOS Apple Team ID | `57JWLP426D` | Source declaration only; portal access was not verified here. |
| Android package | `com.samisabiridrissi.darijatoenglish` | Must remain unchanged for Play Console package ownership. |
| Expo owner | `blockvoltcr7` | Source declaration only; account login/project access was not verified here. |
| EAS project ID | `70c597ff-6021-4069-bb43-9c301ac4baa2` | Present in `app.json`. |

## Decision

Do not add explicit `submit.staging.ios`, `submit.staging.android`, `submit.production.ios`, or `submit.production.android` blocks yet.

Reason: Expo's EAS Submit profiles can stay empty and prompt interactively, but non-interactive source config needs account-owned values such as `ascAppId`, App Store Connect credential strategy, Google Play service-account access, and Android target track. Those values are not locally verifiable without the human account owner and should not be guessed.

## iOS Status

- App Store Connect app record for `com.samisabiridrissi.darijatoenglish`: unknown.
- `ascAppId`: unknown; do not commit a guessed value.
- Apple Developer team access for `57JWLP426D`: unknown from source alone.
- Submit credential strategy: undecided.
- TestFlight submit attempted: no.

Blocking human actions:

1. Confirm the user can access Apple Developer team `57JWLP426D`.
2. Confirm or create the App Store Connect app record for bundle ID `com.samisabiridrissi.darijatoenglish`.
3. Record the App Store Connect Apple ID / `ascAppId` privately enough to configure EAS Submit when the user approves.
4. Choose the iOS credential path: EAS-managed App Store Connect API key, local API key path outside source control, app-specific password via environment variable, or owner-run interactive submit.
5. Accept any App Store Connect agreements and complete 2FA in the portal/CLI as the human account owner.

Next iOS command shape after the blockers are resolved:

```bash
npx eas-cli@latest submit -p ios --profile staging
```

If the user wants to generate explicit EAS Submit config interactively, run only while the account owner is present:

```bash
npx eas-cli@latest submit:configure --platform ios
```

## Android Status

- Google Play Console app record for `com.samisabiridrissi.darijatoenglish`: unknown.
- Google service account JSON/API access: unknown.
- First manual upload requirement: unknown.
- Target track: not confirmed; recommended first beta track is `internal`.
- Google Play submit attempted: no.

Blocking human actions:

1. Confirm Google Play Developer account ownership/access.
2. Confirm or create the Play Console app record for package `com.samisabiridrissi.darijatoenglish`.
3. Decide the first testing track, defaulting to `internal` unless the release owner chooses closed testing.
4. Create and authorize a Google service account for the Play app.
5. Upload the service-account key to EAS credentials or configure a local path outside source control only after explicit approval.
6. Complete any first manual upload step required before API-based Play submit is expected to work.

Next Android command shape after the blockers are resolved:

```bash
npx eas-cli@latest submit -p android --profile staging
```

If the user wants to generate explicit EAS Submit config interactively, run only while the account owner is present:

```bash
npx eas-cli@latest submit:configure --platform android
```

## Production Lane

Production submit remains deferred.

Reasons:

- The task scope is store beta/TestFlight/Google Play testing readiness, not public launch.
- `submit.production` is present but empty.
- Production API URL and production mobile public env readiness were not verified in this task.
- EAS Submit uploads binaries to store distribution pipelines; it does not approve a public App Store or Play Store release by itself.

## Must-Fix Or Follow-Up Outside This Task Scope

- `ai_docs/deployment/README.md` has documentation drift: its "Fields currently absent from source config" list still includes `expo.owner`, `expo.runtimeVersion`, and `expo.extra.eas.projectId`, but those fields are present in `app.json`. This review did not edit the file because it is outside the owned write scope.

## Redaction Check

- No Expo tokens printed or committed.
- No Apple passwords, verification codes, session values, app-specific passwords, `.p8` contents, or private account screenshots included.
- No Google service-account JSON contents included.
- No private account emails included.
- No production release claim made.
