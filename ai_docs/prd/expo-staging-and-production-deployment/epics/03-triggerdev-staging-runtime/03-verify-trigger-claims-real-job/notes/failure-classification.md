# Failure Classification

Use this taxonomy when the real staging job does not reach `succeeded`.

## API

- `/v1/translations` rejects the request.
- Missing `triggerRunId`.
- Job row is not created or storage metadata is missing.

## Trigger

- No deployed worker claims the run.
- Wrong Trigger project or environment.
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

- Clerk session token missing, expired, or not accepted by staging API.

## Fixture Or Body Size

- Audio file too large for current base64 JSON path.
- Unsupported or corrupt audio format.

Record the owner, sanitized error, and next fix before re-running paid provider calls.
