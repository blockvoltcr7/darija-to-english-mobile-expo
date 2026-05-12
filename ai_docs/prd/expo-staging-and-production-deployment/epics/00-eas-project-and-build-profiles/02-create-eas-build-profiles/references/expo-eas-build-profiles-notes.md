# Expo EAS Build Profile Notes

Official Expo references:

- EAS Build with `eas.json`: https://docs.expo.dev/build/eas-json/
- EAS JSON schema reference: https://docs.expo.dev/eas/json/
- EAS environment variable usage: https://docs.expo.dev/eas/environment-variables/usage/

## Relevant Expo Behavior

- `eas.json` lives at the project root next to `package.json`.
- Build configuration belongs under the `build` key.
- The `build` object can contain custom profile names.
- `eas build --profile <profile-name>` selects a build profile.
- If `--profile` is omitted, EAS CLI defaults to `production` when that profile exists.
- `developmentClient: true` indicates a development build using `expo-dev-client`.
- `distribution: internal` is used for direct internal distribution, including physical device QA.
- `environment` can be set on profiles to control which EAS environment is used for builds.
- `channel` should remain explicit so future EAS Update or runtime targeting is not ambiguous.

## Local Decision Needed

The PRD example uses `environment: "preview"` for the `staging` profile. A distinct `staging` EAS environment may be clearer if the team wants separate preview and store-beta config. Record the decision in `notes/staging-environment-decision.md`.
