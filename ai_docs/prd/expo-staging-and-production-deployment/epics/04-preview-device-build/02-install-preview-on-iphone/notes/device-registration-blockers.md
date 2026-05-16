# Device Registration Blockers

Use this note during execution if install fails.

## Possible Owners

- EAS authentication
- Apple Developer portal access
- Wrong Apple team
- iPhone UDID not registered
- Provisioning profile missing the device
- Device added after build; rebuild or re-sign required
- Install link/artifact unavailable
- App installs but fails to launch

## Execution-Time Record

- Blocker: no installable iOS preview artifact exists yet
- Evidence: Task 01 build attempt stopped before build creation because EAS could not find suitable internal-distribution iOS credentials in non-interactive mode
- Owner: human with Expo/EAS and Apple Developer access
- Next action: rerun `npx eas-cli@latest build -p ios --profile preview` interactively or preconfigure iOS internal-distribution credentials, then rebuild
- Rebuild required: yes
- Re-sign required: not applicable until an IPA exists
