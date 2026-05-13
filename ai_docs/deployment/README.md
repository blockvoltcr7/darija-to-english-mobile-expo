# Deployment Runbook

This runbook tracks staging and production deployment assumptions for the Darija to English Expo app. It separates the mobile build/distribution path from the separately deployed Express API and Trigger.dev worker.

## App Identity

Source of truth: `app.json`.

| Field | Current value |
| --- | --- |
| `expo.name` | `Darija to English` |
| `expo.slug` | `darija-to-english-mobile` |
| `expo.version` | `1.0.0` |
| `expo.scheme` | `darijaenglish` |
| `ios.bundleIdentifier` | `com.samisabiridrissi.darijatoenglish` |
| `ios.appleTeamId` | `57JWLP426D` |
| `ios.supportsTablet` | `true` |
| `android.package` | `com.samisabiridrissi.darijatoenglish` |

Fields currently absent from source config:

- `expo.owner`
- `expo.runtimeVersion`
- `ios.buildNumber`
- `android.versionCode`
- `expo.extra.eas.projectId`

Do not change the app name, slug, URL scheme, iOS bundle identifier, Apple Team ID, or Android package as part of normal deployment execution. Any identity change can create a separate native app for EAS credentials, Apple Developer, TestFlight, Google Play, installed app data, and deep links.

## EAS Build Lanes

Source of truth: `eas.json`.

| Profile | Distribution | EAS environment | Channel | Purpose |
| --- | --- | --- | --- | --- |
| `development` | `internal` | `development` | `development` | Development client builds. |
| `preview` | `internal` | `preview` | `preview` | Owner-device preview QA. |
| `staging` | `store` | `staging` | `staging` | TestFlight / Google Play testing lane. |
| `production` | store default | `production` | `production` | Public release lane. |

The staging profile intentionally uses a dedicated `staging` EAS environment instead of sharing `preview`. Preview and staging should receive separate mobile-safe public environment values in the EAS environment setup epic.

## EAS Project Association

The local source does not currently include `expo.extra.eas.projectId`. Running `npx eas-cli@latest init --non-interactive` failed because the shell is not logged in to Expo.

Required external action:

```bash
npx eas-cli@latest login
npx eas-cli@latest init
```

For CI or non-interactive setup, use an Expo access token:

```bash
EXPO_TOKEN=<token> npx eas-cli@latest init --non-interactive
```

Do not commit Expo access tokens or local credentials.

## Account Assumptions

Source config can declare identifiers, but external account ownership must be verified in the relevant portals.

Expo/EAS:

- The intended Expo account must own or have access to the EAS project for `darija-to-english-mobile`.
- EAS initialization should preserve the existing source identity.

Apple:

- `app.json` declares Apple Team ID `57JWLP426D`.
- That source value does not prove the local user is authenticated to the matching Apple Developer account.
- Internal iOS preview distribution may require registering device UDIDs.
- TestFlight setup is deferred to the store-beta/release-prep epic.

Google Play:

- The package name is `com.samisabiridrissi.darijatoenglish`.
- Google Play Console access and package ownership must be verified before internal/closed testing.
- Play testing setup is deferred to the store-beta/release-prep epic.

## Runtime Boundary

EAS builds the mobile binary only. The app still talks to a separately hosted HTTPS Express API through `EXPO_PUBLIC_API_BASE_URL`.

Provider secrets stay server-side:

- OpenAI API keys
- Modal/Darija ASR secrets
- Clerk secret keys
- Supabase service-role keys
- Trigger.dev secrets

Mobile EAS public environment values must only include mobile-safe public values such as `EXPO_PUBLIC_API_BASE_URL` and publishable keys.
