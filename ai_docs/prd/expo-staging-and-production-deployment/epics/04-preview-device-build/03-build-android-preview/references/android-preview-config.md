# Android Preview Config Reference

## Local Config Anchors

- `app.json` Android package is `com.samisabiridrissi.darijatoenglish`.
- `eas.json` `build.preview.distribution = "internal"`.
- `eas.json` `build.preview.environment = "preview"`.
- `eas.json` `build.preview.channel = "preview"`.
- `eas.json` `build.development.developmentClient = true` for development-client fallback.

## Prior Evidence

- Epic 02 verified default EAS envs contain mobile public values for development/preview builds.
- Epic 00 recorded that account-backed EAS commands need EAS login or `EXPO_TOKEN`.
- Epic 00 recorded `expo-doctor` SDK patch-version drift as a separate maintenance risk.

## Official Docs

- EAS build profiles: https://docs.expo.dev/build/eas-json/
- Internal distribution: https://docs.expo.dev/build/internal-distribution/
- Android APK builds: https://docs.expo.dev/build-reference/apk/
- EAS environment variables: https://docs.expo.dev/eas/environment-variables/

## Executor Notes

- Direct Android device/emulator install requires an installable APK artifact.
- AAB-only evidence is useful for store submission but not enough for this internal preview task.
- Android can be explicitly deferred without blocking iPhone install and diagnostics.
