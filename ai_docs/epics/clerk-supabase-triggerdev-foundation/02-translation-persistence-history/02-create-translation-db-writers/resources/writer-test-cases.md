# Writer Test Cases

Use these as implementation smoke checks or manual API-level verification notes.

## Job

- Create job with `clerkUserId`, `profileId`, filename, audio byte estimate, and trace id.
- Reject missing `clerkUserId`.
- Reject missing `jobId` on update helpers.

## Provider Runs

- Write successful OpenAI transcription run.
- Write successful Modal Darija ASR run.
- Write successful OpenAI consolidation run.
- Write successful OpenAI translation run.
- Write failed provider run with safe error fields.

## Result

- Write one final result for a succeeded job.
- Ensure duplicate result writes for the same job fail clearly or upsert intentionally.

## Failure

- Mark job failed with a user-safe message.
- Confirm no helper accepts or stores `audio_base64`.
