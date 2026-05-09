---
name: darija-mobile-auth-qa
description: Launch and verify Clerk authentication for the Darija to English Expo mobile app on iOS simulator and Android emulator. Use when testing this repo's Clerk auth migration, Expo dev-client builds, Android/iOS sign-in flows, Clerk test users, native AuthView behavior, protected route access, or auth/build regressions in /Users/samisabir-idrissi/dev/codex-projects/darija-to-english-mobile-expo.
---

# Darija Mobile Auth QA

Use this skill only for this project. The app uses Expo Router, Clerk native UI, and a local Node API. Test with a dev-client/native build, not Expo Go.

## Preflight

1. Work from `/Users/samisabir-idrissi/dev/codex-projects/darija-to-english-mobile-expo`.
2. Confirm `@clerk/expo` remains pinned to exact `3.2.8` unless the task is explicitly to retest newer Clerk versions.
3. Do not print `.env.local` values. It is acceptable for Expo commands to print exported variable names.
4. Start the local API when testing translation or protected API calls:

```bash
npm run api
curl http://localhost:8787/health
```

The health response should include `models.openai_transcription`, `models.consolidation`, and `models.translation`.

## iOS Simulator

Use localhost for the API URL:

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:8787 npm run ios
```

Auth test flow:

1. Sign up or sign in through Clerk AuthView.
2. Use a Clerk test email containing `+clerk_test`, for example `sami+clerk_test_ios@example.com`.
3. Enter OTP `424242`.
4. If Clerk asks for password creation after OTP, set a temporary strong password and continue.
5. Verify the app leaves Clerk AuthView and reaches the protected Darija screen with the signed-in email visible.

## Android Emulator

Use JDK 17 and the Android emulator loopback API URL:

```bash
JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home \
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8787 \
npm run android
```

If running Gradle directly, keep the same JDK:

```bash
JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home \
./gradlew app:assembleDebug -x lint -x test --configure-on-demand --build-cache \
  -PreactNativeDevServerPort=8081 -PreactNativeArchitectures=arm64-v8a
```

Auth test flow:

1. Launch the Android dev build and clear stale app state if the flow is polluted:

```bash
adb shell pm clear com.samisabiridrissi.darijatoenglish
```

2. Sign up or sign in through Clerk AuthView.
3. Use a Clerk test email containing `+clerk_test`, for example `sami+clerk_test_android@example.com`.
4. Enter OTP `424242`.
5. If Clerk asks for password creation and you are driving input with `adb shell input text`, use an alphanumeric password. Special characters can be dropped or rejected by the emulator input method.
6. Verify Android enters the protected Darija screen and shows the signed-in test email in the header.

## Useful ADB Checks

Capture screenshots during the flow:

```bash
adb exec-out screencap -p > /tmp/darija-android-auth.png
```

Inspect visible UI text:

```bash
adb shell uiautomator dump /sdcard/window.xml >/dev/null
adb exec-out cat /sdcard/window.xml | rg -i "darija|sign|verify|code|email|account|clerk|password|record|upload"
```

Avoid using encoded `+` values such as `%2B` with `adb shell input text`; Clerk needs a real email address and the field may receive the literal encoded text.

## Verification

Run these after auth, dependency, or native build changes:

```bash
node --check server/index.mjs
npm run typecheck
npm run lint
npx expo-doctor
```

For successful auth QA, record which platform was tested, the test email pattern used, whether OTP `424242` was accepted, and whether the protected Darija screen loaded with the signed-in email visible.
