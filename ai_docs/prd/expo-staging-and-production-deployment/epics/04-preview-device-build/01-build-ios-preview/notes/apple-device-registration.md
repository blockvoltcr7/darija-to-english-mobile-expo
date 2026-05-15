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

- Apple account action taken:
- Device registration status:
- Rebuild required:
- Re-sign required:
- Owner/blocker:
