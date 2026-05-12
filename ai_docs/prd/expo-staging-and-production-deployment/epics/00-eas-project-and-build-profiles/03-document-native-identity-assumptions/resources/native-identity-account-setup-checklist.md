# Native Identity Account Setup Checklist

Official references:

- Expo app config: https://docs.expo.dev/versions/latest/config/app/
- EAS JSON reference: https://docs.expo.dev/eas/json/
- Apple device registration overview: https://developer.apple.com/help/account/devices/devices-overview/
- Apple device registration updates: https://developer.apple.com/help/account/reference/device-registration-updates/
- Apple TestFlight overview: https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/
- Google Play internal testing: https://support.google.com/googleplay/android-developer/answer/9845334?hl=en-EN

## Source-Controlled Identity

- [ ] Confirm `ios.bundleIdentifier`.
- [ ] Confirm `android.package`.
- [ ] Confirm app name, slug, version, and scheme.
- [ ] Confirm whether `expo.owner`, `expo.runtimeVersion`, `ios.buildNumber`, or `android.versionCode` exist.

## Expo/EAS

- [ ] Confirm EAS project association from Task 01.
- [ ] Confirm `eas.json` profiles from Task 02 do not rename the app.
- [ ] Confirm future EAS env work will set public mobile config, not server secrets.

## Apple

- [ ] Confirm Apple Developer account/team access for team `57JWLP426D`.
- [ ] Confirm whether internal iOS preview needs registered device UDIDs for ad hoc/internal distribution.
- [ ] Confirm TestFlight is deferred to later store-beta tasks.

## Google Play

- [ ] Confirm Google Play Console access.
- [ ] Confirm package ownership for `com.samisabiridrissi.darijatoenglish`.
- [ ] Confirm internal testing track setup is deferred to later store-beta tasks.
