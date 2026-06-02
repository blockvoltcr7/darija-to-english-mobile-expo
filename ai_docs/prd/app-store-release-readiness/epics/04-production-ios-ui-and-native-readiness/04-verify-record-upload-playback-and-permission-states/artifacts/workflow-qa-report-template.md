# Workflow QA Report Template

This is a template only. Fill it during execution with real evidence.

## Build And Environment

| Field | Value |
| --- | --- |
| Branch |  |
| Commit SHA |  |
| Build profile/type |  |
| App version/build number |  |
| API environment |  |
| Diagnostics enabled? |  |
| Device/simulator |  |
| Date/time |  |

## Fixture

| Field | Value |
| --- | --- |
| Fixture filename |  |
| Fixture size |  |
| Sensitive content? | Expected no |

## Results

| Path | Result | Sanitized evidence |
| --- | --- | --- |
| Clean microphone prompt |  |  |
| Record submit/result |  |  |
| Upload submit/result |  |  |
| English playback |  |  |
| Permission denied/recovery |  |  |

## Sanitized Runtime IDs

| ID type | Value |
| --- | --- |
| Job ID |  |
| Trigger run ID |  |
| Trace ID |  |

## Blockers

- 

## Redaction Check

- [ ] No Clerk token.
- [ ] No API key or `.env` value.
- [ ] No private audio contents.
- [ ] No full transcript.
- [ ] No generated audio bytes.
