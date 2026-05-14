# Staging Job Evidence Template

Execution-time artifact. Fill after running a real staging job.

## Request

- API URL:
- Fixture name:
- Approx audio duration:
- Approx audio size:
- Clerk user: sanitized test-user label only
- Timestamp:

## Queued Response

- HTTP status:
- `jobId`:
- `triggerRunId`:
- `detailUrl`:

## Trigger Evidence

- Trigger project/environment:
- Task id:
- Run id:
- Started:
- Finished:
- Final run status:

## API Polling Timeline

```text
<timestamp> queued
<timestamp> running
<timestamp> succeeded|failed
```

## Result Visibility

- [ ] English translation present
- [ ] Consolidated Darija present
- [ ] Raw OpenAI transcript present
- [ ] Raw Darija transcript present
- [ ] Model metadata present

## Redaction Check

- [ ] No Clerk session token
- [ ] No API keys or service-role keys
- [ ] No private audio contents
- [ ] No full private transcript unless explicitly approved
