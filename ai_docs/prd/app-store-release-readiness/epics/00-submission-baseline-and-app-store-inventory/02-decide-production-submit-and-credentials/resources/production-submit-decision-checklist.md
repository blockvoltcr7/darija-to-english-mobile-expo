# Production Submit Decision Checklist

## Decision Record Fields

| Field | Decision |
| --- | --- |
| Production App Store Connect app ID handling |  |
| Production submit method | App Store Connect API key / interactive Apple ID / other |
| Where credentials live | EAS secure storage / Apple account flow / other |
| Who owns Apple 2FA and account prompts |  |
| Whether `eas.json` should set `submit.production.ios.ascAppId` |  |
| Whether production build and submit can be run non-interactively |  |
| Known blockers |  |
| Release-owner approval |  |

## Safe Future Command Draft

Do not run these until production runtime, legal/privacy/account-deletion gates, and release-owner approval are satisfied.

```bash
npx eas-cli@latest build -p ios --profile production
npx eas-cli@latest submit -p ios --profile production --latest
```

For a config-only dry check:

```bash
npx eas-cli@latest config --profile production --platform ios --non-interactive
```

## Evidence To Capture

- App ID only if safe and owner-approved.
- Build profile, channel, environment, app version, and bundle ID.
- Whether submit uses interactive Apple ID or API-key-backed EAS credentials.
- Any blocker as a sanitized status, not credential output.

## Evidence Not To Capture

- `.p8` private key contents.
- Apple password, 2FA code, session cookies, or access tokens.
- Expo access token.
- EAS credential store screenshots that show secret material.
- App Store Connect API key private material.
