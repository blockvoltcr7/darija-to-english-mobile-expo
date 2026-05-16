# EAS iOS Preview Profile Reference

## Local Config Anchors

- `eas.json` has `build.preview.distribution = "internal"`.
- `eas.json` has `build.preview.environment = "preview"`.
- `eas.json` has `build.preview.channel = "preview"`.
- `eas.json` has `build.development.developmentClient = true`, `environment = "development"`, and `distribution = "internal"`.
- `app.json` has iOS bundle ID `com.samisabiridrissi.darijatoenglish`.
- `app.json` has Apple team ID `57JWLP426D`.
- `app.json` has owner `blockvoltcr7`.
- `app.json` has EAS project ID `70c597ff-6021-4069-bb43-9c301ac4baa2`.

## Prior Evidence

- Epic 00 verified required EAS profiles exist and recorded an EAS auth blocker for account-backed inspection commands.
- Epic 00 recorded `expo-doctor` patch-version drift as a dependency-maintenance follow-up.
- Epic 02 verified default EAS `development` and `preview` environments contain mobile public values for API URL and Clerk publishable key presence.
- Epic 02 verified custom EAS environments are plan-gated on the current account.

## Official Docs

- EAS build profiles and internal distribution: https://docs.expo.dev/build/eas-json/
- EAS environment variables: https://docs.expo.dev/eas/environment-variables/
- EAS JSON reference: https://docs.expo.dev/eas/json/
- Internal distribution: https://docs.expo.dev/build/internal-distribution/

## Executor Notes

- Treat `preview` as the primary internal-distribution build profile.
- Treat `development` as a documented fallback for a development-client build.
- Do not infer correctness from the EAS environment name alone; Task 04 verifies the baked API URL in the installed app.
