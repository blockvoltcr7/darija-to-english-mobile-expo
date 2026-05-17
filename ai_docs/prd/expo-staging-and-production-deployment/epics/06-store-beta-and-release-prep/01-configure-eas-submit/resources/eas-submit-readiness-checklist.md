# EAS Submit Readiness Checklist

Use this checklist before editing `eas.json` submit profiles or attempting a store-beta submit.

## Static Preflight

```bash
npx eas-cli@latest whoami
npx eas-cli@latest project:info
npx eas-cli@latest build:list --limit 5
node -e 'const eas=require("./eas.json"); for (const p of ["staging","production"]) { if (!eas.submit?.[p]) throw new Error(`missing submit.${p}`); } console.log(eas.submit);'
```

Confirm:

- Expo account is the intended account for project `70c597ff-6021-4069-bb43-9c301ac4baa2`.
- `submit.staging` and `submit.production` exist.
- `staging` build profile remains store-distribution and uses the default EAS `preview` environment until the Expo plan supports a custom staging environment.
- Production submit is not attempted until a production API URL and production public EAS env values exist.
- `app.json` still resolves iOS bundle identifier and Android package as `com.samisabiridrissi.darijatoenglish`.
- Any `ai_docs/deployment/README.md` identity drift is corrected before using docs as the source for store account setup.

## iOS Readiness

Confirm with the account owner:

- Apple Developer access exists for team `57JWLP426D`.
- App Store Connect app record exists for bundle ID `com.samisabiridrissi.darijatoenglish`, or the owner is ready to create it interactively.
- `ascAppId` is known before making non-interactive submit configuration.
- App Store Connect API key or app-specific password strategy is chosen.
- No `.p8`, password, Apple token, or local credential file is committed.

Expected command shape after readiness is confirmed:

```bash
npx eas-cli@latest submit -p ios --profile staging
```

Interactive configuration command shape, only while the account owner is present:

```bash
npx eas-cli@latest submit:configure --platform ios
```

## Android Readiness

Confirm with the account owner:

- Google Play Developer account access exists.
- Play Console app record exists for package `com.samisabiridrissi.darijatoenglish`.
- A Google Service Account key is created and uploaded to EAS credentials, or a safe local credential path is intentionally configured outside source control.
- First manual upload requirement has been satisfied for the Play app before API-based submit is treated as unblocked.
- Target track is selected for store beta, usually `internal` unless the user explicitly chooses another testing track.
- No service-account JSON file is committed.

Expected command shape after readiness is confirmed:

```bash
npx eas-cli@latest submit -p android --profile staging
```

Interactive configuration command shape, only while the account owner is present:

```bash
npx eas-cli@latest submit:configure --platform android
```

## Safe Stop Conditions

Stop and record a blocker instead of continuing if:

- EAS asks for Apple, Google, or Expo credentials that only the user should enter.
- App Store Connect app ID or Play Console package ownership is unknown.
- Production API URL is still pending but the action would configure or submit a production release lane.
- The command would expose tokens, service-account JSON, app-specific passwords, `.p8` key material, or private account details in committed files.
- The user is not present for login, 2FA, paid account, app-record, agreement, or credential prompts.
