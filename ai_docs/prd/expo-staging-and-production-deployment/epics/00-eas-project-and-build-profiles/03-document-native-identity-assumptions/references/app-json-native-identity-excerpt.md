# App JSON Native Identity Excerpt

Source file: `app.json`

## Current App Identity

| Field | Value |
| --- | --- |
| `expo.name` | `Darija to English` |
| `expo.slug` | `darija-to-english-mobile` |
| `expo.version` | `1.0.0` |
| `expo.scheme` | `darijaenglish` |
| `ios.bundleIdentifier` | `com.samisabiridrissi.darijatoenglish` |
| `ios.appleTeamId` | `57JWLP426D` |
| `ios.supportsTablet` | `true` |
| `android.package` | `com.samisabiridrissi.darijatoenglish` |

## Absent Fields At Time Of Writing

- `expo.owner`
- `expo.runtimeVersion`
- `ios.buildNumber`
- `android.versionCode`

## Notes

Current source wins over PRD prose if values diverge. Any identity change should be treated as a separate explicit decision because it can affect EAS credentials, Apple identifiers, TestFlight, Google Play package ownership, and installed app continuity.
