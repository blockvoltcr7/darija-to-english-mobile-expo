# Account Access And Ownership Assumptions

## Known Source Config

- iOS Apple Team ID in `app.json`: `57JWLP426D`
- iOS bundle identifier: `com.samisabiridrissi.darijatoenglish`
- Android package: `com.samisabiridrissi.darijatoenglish`

## Assumptions To Verify During Execution

- The current Expo account can own or access the EAS project for this app.
- The current Apple Developer account can use team `57JWLP426D`.
- The current Apple account can register required test devices if internal distribution is used.
- The current Google Play account can create or manage an app with package `com.samisabiridrissi.darijatoenglish`.

## Important Distinction

Source config can declare an identifier, but Apple and Google ownership still lives in external developer portals. Do not treat a value in `app.json` as proof of portal access.
