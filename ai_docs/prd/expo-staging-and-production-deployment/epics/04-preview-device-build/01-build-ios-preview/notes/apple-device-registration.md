# Apple Device Registration Notes

## Decision Points

- Internal iOS distribution may require the target iPhone UDID to be registered with the Apple team before install works.
- The configured Apple team ID is `57JWLP426D`, but source config does not prove current portal access.
- If the device is registered after an IPA is built, rebuild or re-sign may be required.

## Known Risks

- Missing Apple Developer access.
- Missing or wrong Apple team selection.
- Target iPhone absent from ad hoc provisioning profile.
- EAS build succeeds but install fails because the device was registered too late.

## Execution-Time Notes

- Apple account action taken: none; non-interactive CLI stopped before credential creation
- Device registration status: unknown
- Rebuild required: likely after credentials/device profile are configured
- Re-sign required: not applicable until an IPA exists
- Owner/blocker: human must run the iOS build interactively or configure suitable iOS internal-distribution credentials in EAS/Apple

## 2026-05-16 Build Attempt

Command:

```bash
npx eas-cli@latest build -p ios --profile preview --non-interactive
```

Sanitized result:

- EAS auth succeeded.
- EAS initialized remote iOS build number to `1`.
- EAS warned that `ios.infoPlist.ITSAppUsesNonExemptEncryption` is missing.
- EAS used remote iOS credentials, then failed credential setup because no suitable internal-distribution credentials were available in non-interactive mode.

Next action:

- Human should rerun the build interactively and complete Apple credential/device prompts, or preconfigure the required iOS internal-distribution credentials before retrying non-interactively.

## 2026-05-16 Human Interactive Retry

The user reran:

```bash
npx eas-cli@latest build -p ios --profile preview
```

Observed outcome:

- User answered the encryption prompt as standard/exempt encryption.
- EAS installed `expo-updates`.
- EAS configured `updates.url` to `https://u.expo.dev/70c597ff-6021-4069-bb43-9c301ac4baa2`.
- EAS configured `runtimeVersion` for iOS and Android with policy `appVersion`.
- EAS stopped and requested the build command be rerun to pick up the new update configuration.

Codex cleaned the duplicate Android permissions introduced during configuration and reran:

```bash
npx eas-cli@latest build -p ios --profile preview --non-interactive
```

Sanitized retry result:

- EAS created update channel `preview` and branch `preview`.
- EAS used remote iOS credentials.
- EAS still failed credential setup because no suitable internal-distribution credentials were available in non-interactive mode.

Current blocker remains Apple/EAS credential setup for iOS internal distribution.
