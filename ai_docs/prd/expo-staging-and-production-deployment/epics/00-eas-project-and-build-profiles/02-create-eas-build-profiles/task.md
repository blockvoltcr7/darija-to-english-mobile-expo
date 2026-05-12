# Task 02: Create EAS Build Profiles

## Type

Infrastructure

## Context

PRD `05-technical-specifications.md` defines four EAS build lanes: local development client, owner-device preview, staging store beta, and production release. This task creates the root `eas.json` that future environment configuration, preview builds, TestFlight/Play testing, and release readiness work will depend on. It must preserve the current backend boundary: EAS builds the mobile binary, while the Express API and Trigger worker deploy separately.

## Implementation

- Add root `eas.json` using the PRD `05` profile matrix as the baseline.
- Set `cli.version` and `appVersionSource` explicitly.
- Define `build.development` with `developmentClient: true`, internal distribution, `development` environment, and `development` channel.
- Define `build.preview` for internal distribution with `preview` environment/channel.
- Define `build.staging` for store distribution with `staging` channel and auto-increment; document whether its EAS environment is `preview` or a distinct `staging`.
- Define `build.production` with production environment/channel and auto-increment.
- Add empty `submit.staging` and `submit.production` placeholders only; do not commit store credentials.

## Acceptance Criteria

- [ ] Root `eas.json` exists and is valid JSON.
- [ ] `development`, `preview`, `staging`, and `production` build profiles exist with explicit channels and environments.
- [ ] Staging and production submit sections exist without credentials or account secrets.
- [ ] Profile names and intent match PRD `05-technical-specifications.md`.
- [ ] No mobile build profile embeds OpenAI, Modal, Supabase service role, Clerk secret, or Trigger secret values.

## Dependencies

- Depends On: `initialize-eas-project`
- Blocks: `document-native-identity-assumptions`
- Blocks: `verify-eas-config`
- Blocks: `../02-eas-environments-and-config-safety/01-configure-eas-public-environments`

## Technical Notes

- The PRD example uses `environment: "preview"` for staging, but a dedicated `staging` EAS environment may be cleaner. If changed, document the decision in this task's notes and future deployment docs.
- Do not add API URLs in `eas.json`; environment values are handled in Epic 02.
- `package.json` currently has no EAS scripts. Keep scripts unchanged unless a wrapper materially improves repeatability.
- Later tasks should use `npx eas-cli@latest build -p ios --profile preview` and Android equivalent from this profile set.

## Artifact Slots

- `artifacts/`: final profile matrix review and sanitized `eas.json` validation output.
- `references/`: PRD `05` profile excerpt and any official Expo profile notes used.
- `resources/`: exact EAS validation/build-inspection commands.
- `notes/`: staging environment naming decision and any profile deviations from the PRD.
