# EAS iOS Internal Install Notes

## Local Anchors

- Task 01 owns the iOS build ID or URL.
- `eas.json` `preview` profile is internal distribution.
- `app.json` iOS bundle ID is `com.samisabiridrissi.darijatoenglish`.
- `app.json` Apple team ID is `57JWLP426D`.

## Official Docs

- Internal distribution overview: https://docs.expo.dev/build/internal-distribution/
- Internal distribution tutorial: https://docs.expo.dev/tutorial/eas/internal-distribution-builds/
- EAS CLI reference: https://docs.expo.dev/eas/cli/

## Install Path

- Use the EAS build detail page Install link, QR flow, or Expo Orbit.
- Do not substitute simulator install evidence.
- A preview internal-distribution build should launch without a development server.

## Device Registration

- iOS internal distribution uses ad hoc-style device eligibility.
- If the iPhone was added after the build, rebuild or re-sign may be needed.
- Treat install failure as a provisioning/device-registration blocker until proven otherwise.
