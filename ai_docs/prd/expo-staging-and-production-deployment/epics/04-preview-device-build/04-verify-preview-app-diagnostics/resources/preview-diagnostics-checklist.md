# Preview Diagnostics Checklist

## Inputs

- Installed iPhone build from Task 02.
- Build ID/profile evidence from Task 01.
- Expected API URL from EAS env evidence.

## Steps

1. Launch the app from the physical iPhone home screen.
2. Confirm signed-out landing or auth entry is reachable.
3. Sign in only if needed to reach `translate.tsx`; do not record tokens.
4. On the translate screen, capture the header chip that shows the API label and URL.
5. Expand Diagnostics.
6. Capture the initial API target diagnostic line.
7. Trigger a lightweight `/health` check through the app flow if possible.
8. Confirm the URL starts with `https://` and is not local.
9. Record build ID/profile/channel from EAS evidence.
10. Fill the artifact template.

## Stop Conditions

- API URL is local.
- API URL is malformed.
- API URL is the wrong host.
- Auth entry is unreachable.
- Diagnostics panel is missing or does not show the API URL.
- Health check fails and owner cannot be classified.

## Redaction

- Do not capture Clerk session tokens.
- Do not capture secret values.
- Do not capture private audio contents.
- Do not capture full transcripts.
