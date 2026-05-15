# Development Runtime Job Test Commands

These commands are templates. Replace placeholders locally and do not commit tokens or audio contents.

## Health Check

```bash
API_BASE_URL="http://localhost:8787"
curl -sS "${API_BASE_URL}/health"
```

Use the hosted Cloud Run API URL only if Task 01 confirms it dispatches to the same Trigger.dev Development environment as the local worker.

## Create Base64 Payload

```bash
base64 -i /absolute/path/to/non-sensitive-audio.m4a > /tmp/darija-audio.b64
```

## Submit Translation

```bash
TOKEN="<clerk-session-token>"
API_BASE_URL="http://localhost:8787"
AUDIO_BASE64="$(cat /tmp/darija-audio.b64)"

curl -sS -X POST "${API_BASE_URL}/v1/translations" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  --data "$(jq -n --arg filename "development-fixture.m4a" --arg audio_base64 "$AUDIO_BASE64" '{filename:$filename,audio_base64:$audio_base64}')"
```

## Poll Translation

```bash
JOB_ID="<job-id>"
API_BASE_URL="http://localhost:8787"

curl -sS "${API_BASE_URL}/v1/translations/${JOB_ID}" \
  -H "Authorization: Bearer ${TOKEN}"
```

## Evidence To Capture

- job ID
- Trigger run ID
- first queued response status
- final status
- provider/run failure owner if any
- no token, no full transcript, no private audio
