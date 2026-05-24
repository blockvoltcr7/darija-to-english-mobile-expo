2026-05-21

Status: blocked until fresh-user TTS QA produces a successful generated artifact and a second Clerk test user is available.

Already checked:

- Unauthenticated playback route request returned `401 Unauthorized` during Epic 03 local route verification.
- Static route review confirms owner lookup filters by `job_id`, `clerk_user_id`, kind, and `status = 'succeeded'`.
- Failed/running/missing artifacts return through the same no-successful-artifact path.

Remaining live checks:

- Force or simulate TTS provider/storage failure and verify the text result remains visible.
- Verify failed TTS metadata appears safely in API detail.
- Use a second signed-in Clerk user to request the owner's playback URL and confirm `404`.
- Review live API/Trigger logs for accidental leakage.

Do not record Clerk tokens, API keys, `.env` values, private audio contents, full transcripts, generated audio bytes, or raw bearer headers.
