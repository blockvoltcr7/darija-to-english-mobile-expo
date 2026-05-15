# iPhone Install Checklist

## Inputs From Task 01

- iOS build ID:
- Build profile:
- Build URL/private reference:
- Artifact/install URL available:

## Account And Device Preflight

```bash
npx eas-cli@latest whoami
npx eas-cli@latest device:list --apple-team-id 57JWLP426D
npx eas-cli@latest build:list -p ios --build-profile preview --status finished --limit 5
```

If the device is missing and account access allows adding it, register the device through EAS or the Apple Developer portal, then rebuild or re-sign as appropriate.

Optional re-sign reference:

```bash
npx eas-cli@latest build:resign -p ios --source-profile preview --target-profile preview --id <build-id>
```

## Install

1. Open the EAS build details page privately.
2. Use Install link, QR flow, or Expo Orbit.
3. Launch from the iPhone home screen.
4. Confirm landing/sign-in appears.
5. Note whether the API chip is visible and non-local; Task 04 owns full diagnostics verification.

## Do Not Capture

- Clerk session tokens
- Apple account private details
- Secret values
- Public-ready install links
- Personal device identifiers beyond what is needed in private QA notes
