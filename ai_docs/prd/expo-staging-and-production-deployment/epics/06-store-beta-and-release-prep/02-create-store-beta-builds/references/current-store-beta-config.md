# Current Store Beta Config

Source files checked during support-material audit:

- `eas.json`
- `app.json`
- `package.json`
- `ai_docs/deployment/README.md`
- Epic 04 preview-device evidence
- Epic 05 staging E2E evidence
- Expo docs for EAS Build and EAS Submit

## Build Profiles

| Profile | Distribution | EAS environment | Channel | Store-beta relevance |
| --- | --- | --- | --- | --- |
| `preview` | `internal` | `preview` | `preview` | Already used for physical-device preview QA. Not a store beta build. |
| `staging` | `store` | `preview` | `staging` | Primary TestFlight / Google Play testing build profile for this task. |
| `production` | store default | `production` | `production` | Future public release lane. Do not use until production API URL and production env values exist. |

Important: `staging` intentionally reads EAS `preview` environment values on the current Expo plan. Verify the active API target in-app after install or TestFlight/Play processing; do not assume the profile name proves the environment.

## App Identity

| Field | Current value |
| --- | --- |
| Expo account owner | `blockvoltcr7` |
| EAS project ID | `70c597ff-6021-4069-bb43-9c301ac4baa2` |
| iOS bundle ID | `com.samisabiridrissi.darijatoenglish` |
| Apple team ID in source | `57JWLP426D` |
| Android package | `com.samisabiridrissi.darijatoenglish` |
| App version | `1.0.0` |
| Runtime version policy | `appVersion` |

Do not change app identity fields as part of this task. Identity changes can create a different native app, credential set, store listing, installed app, and deep-link target.

## Submit Profiles

`eas.json` currently has empty submit profiles:

```json
{
  "submit": {
    "staging": {},
    "production": {}
  }
}
```

This means EAS CLI may prompt or depend on externally configured credentials. A store-beta execution should record whether submission used CLI prompts, EAS-managed credentials, App Store Connect API key config, Apple ID prompts, or Google service-account config.

## Official Expo Anchors

- EAS Build profiles are named groups selected with `eas build --profile <profile-name>`: https://docs.expo.dev/build/eas-json/
- Store builds are app-store/TestFlight oriented; internal preview builds are not equivalent to store builds: https://docs.expo.dev/build/eas-json/
- EAS Submit uploads binaries to App Store Connect/TestFlight or Google Play tracks, but TestFlight is not an App Store production release: https://docs.expo.dev/submit/introduction/
- EAS Submit config supports Google Play tracks and iOS App Store Connect IDs/keys under `submit` profiles: https://docs.expo.dev/eas/json/
