# Diagnostics Evidence Template

Fill during execution.

## Device And Build

- Timestamp: `2026-05-16T21:17:01Z`
- Device model: not captured
- OS version: not captured
- Platform: physical iPhone
- EAS build ID: `32823c20-98fe-46ea-bed9-991f4b38ff27`
- Build profile: `preview`
- EAS environment: `preview`
- Channel: `preview`
- Install source: EAS internal distribution

## App Diagnostics

- Visible API label: non-local HTTPS API verified through installed build behavior
- Visible API URL: development HTTPS Cloud Run API configured in EAS public env; full value not repeated here
- API URL protocol: `https`
- API URL host: Cloud Run API host
- Local URL warning present: no
- Diagnostics panel expanded: yes
- API target diagnostic line captured: yes

## Auth And Health

- Auth entry reachable: yes
- Signed-in translate screen reachable: yes
- Health check attempted: yes, through real upload/record translation flow
- Health check result: upload and record flows completed successfully with final translations
- Failure owner if any: none; initial queued timeout was caused by disconnected Trigger.dev Development worker

## Evidence References

- Screenshot: API chip: user-provided iPhone runtime screenshots
- Screenshot: diagnostics panel: `Screenshot 2026-05-16 at 5.06.22 PM.png`
- Screenshot: auth entry: `Screenshot 2026-05-16 at 4.23.04 PM.png`
- Private notes: Trigger run initially stayed queued because local Development worker was disconnected. After running `npm run trigger:dev -- --env-file .env.local --skip-update-check`, upload and record audio both worked and produced translations. Modal received work after the Trigger worker connected.

## Redaction Check

- [x] No tokens
- [x] No session IDs
- [x] No Clerk key values
- [x] No secret values
- [x] No private audio contents
- [x] No full transcripts
