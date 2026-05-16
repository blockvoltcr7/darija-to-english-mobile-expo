# Failure Classification

Use this taxonomy when the real development-runtime job does not reach `succeeded`.

## API

- `/v1/translations` rejects the request.
- Missing `triggerRunId`.
- Job row is not created or storage metadata is missing.

## Trigger

- No deployed worker claims the run.
- Wrong Trigger project or environment; the API and local worker are not both using Development.
- Worker bundle cannot import server pipeline modules.

## Supabase

- Worker cannot claim `translation_jobs`.
- Worker cannot download original audio from private storage.
- Result/provider rows fail to persist.

## Modal Darija ASR

- HTTP error, timeout, auth failure, or empty Darija transcript.

## OpenAI

- Transcription, consolidation, or translation call fails or returns empty text.

## Auth

- Clerk session token missing, expired, or not accepted by the API path used for QA.

## Fixture Or Body Size

- Audio file too large for current base64 JSON path.
- Unsupported or corrupt audio format.

Record the owner, sanitized error, and next fix before re-running paid provider calls.

## 2026-05-15 Development Run

No failure owner assigned. The local API and local Trigger.dev Development worker completed run `run_cmp79j8xk9iy50ilm5ef4lv2t` for job `365b4130-71b9-4cbc-9858-ab4e2a858313` with terminal status `succeeded`.
