# EAS Profile Identity Matrix

Use this matrix during Task 04 execution to compare `eas.json`, `app.json`, and deployment docs.

## Expected Profiles

| Profile | Required? | Expected channel | Expected environment | Distribution |
| --- | --- | --- | --- | --- |
| `development` | yes | `development` | `development` | `internal` |
| `preview` | yes | `preview` | `preview` | `internal` |
| `staging` | yes | `staging` | `preview` or documented `staging` decision | `store` |
| `production` | yes | `production` | `production` | store/default |

## Expected Identity

| Source | Field | Expected value |
| --- | --- | --- |
| `app.json` | `expo.name` | `Darija to English` |
| `app.json` | `expo.slug` | `darija-to-english-mobile` |
| `app.json` | `expo.scheme` | `darijaenglish` |
| `app.json` | `ios.bundleIdentifier` | `com.samisabiridrissi.darijatoenglish` |
| `app.json` | `ios.appleTeamId` | `57JWLP426D` |
| `app.json` | `android.package` | `com.samisabiridrissi.darijatoenglish` |

## Verification Output

During execution, record pass/fail/blocker results in `artifacts/verification-summary.md`.
