# Fresh-User Consent QA Checklist

Use a fresh Clerk test user and non-sensitive audio fixture.

- [ ] Sign in as a fresh user with no existing consent rows.
- [ ] Attempt upload or record submission.
- [ ] Confirm the client blocks submission and shows current consent copy before any job is queued.
- [ ] Accept consent.
- [ ] Submit a short non-sensitive audio fixture.
- [ ] Confirm `/v1/translations` returns a queued job and the app reaches `Complete`.
- [ ] Submit a second audio fixture without accepting again and confirm consent is reused for the current version.
- [ ] Bypass the client UI with a redacted-token curl request for a user missing consent and confirm the server rejects before storage/Trigger/provider calls.
- [ ] Confirm logs include safe IDs/statuses only: `traceId`, job ID, Trigger run ID, status, byte counts.
- [ ] Confirm logs and artifacts do not include Clerk session tokens, private audio contents, full transcripts, generated audio bytes, or API keys.
