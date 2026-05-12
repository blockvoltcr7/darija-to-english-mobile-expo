# Epic 04: Preview Device Build

## Objective

Build and install preview app binaries on real devices, with diagnostics proving they target the staging API rather than local development URLs.

## Scope

- Build iOS preview through EAS.
- Install on a physical iPhone through internal distribution or a chosen beta path.
- Build Android preview if Android scope is active.
- Verify app diagnostics and authenticated app entry.

## Out Of Scope

- Full TestFlight release candidate.
- Production App Store or Play Store submission.
- Backend deployment.

## Tasks

| # | Task | Type | Depends On |
| --- | --- | --- | --- |
| 01 | `build-ios-preview` | Infrastructure | `00-eas-project-and-build-profiles/verify-eas-config`, `02-eas-environments-and-config-safety/add-non-local-api-diagnostics` |
| 02 | `install-preview-on-iphone` | Code | `build-ios-preview` |
| 03 | `build-android-preview` | Infrastructure | `00-eas-project-and-build-profiles/verify-eas-config`, `02-eas-environments-and-config-safety/add-non-local-api-diagnostics` |
| 04 | `verify-preview-app-diagnostics` | Code | `install-preview-on-iphone` |

## Verification

- Preview iOS build installs on the physical iPhone.
- App diagnostics show the staging HTTPS API URL.
- Sign-in/sign-up screens are reachable in the installed build.
- Android preview outcome is captured if Android is in scope.

