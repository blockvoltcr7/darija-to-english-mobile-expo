# Release Config Decisions

Fill this during execution if decisions are still unresolved.

| Decision | Owner | Current answer | Blocks |
| --- | --- | --- | --- |
| Production API URL is verified and safe for `EXPO_PUBLIC_API_BASE_URL` | Release owner |  | Production EAS env, screenshots, final smoke test |
| Production legal/privacy URLs are public | Release owner |  | Signup/account/legal copy, App Store metadata |
| Consent version value | Release owner |  | Consent gate and release evidence |
| OTA policy version value | Release owner |  | EAS Update policy evidence |
| Production diagnostics default | Engineering/release owner | Expected `false` | Public screenshots and App Review UI |

Do not record real secret values in this file.
