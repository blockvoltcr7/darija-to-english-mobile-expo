# Staging Job Test Commands

These commands are templates. Replace placeholders locally and do not commit tokens or audio contents.

## Health Check

```bash
curl -sS https://darija-api-staging-nwjxqrn2ra-uc.a.run.app/health
```

## Create Base64 Payload

```bash
base64 -i /absolute/path/to/non-sensitive-audio.m4a > /tmp/darija-audio.b64
```

## Submit Translation

```bash
TOKEN="<clerk-session-token>"
AUDIO_BASE64="$(cat /tmp/darija-audio.b64)"

curl -sS -X POST https://darija-api-staging-nwjxqrn2ra-uc.a.run.app/v1/translations \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  --data "$(jq -n --arg filename "staging-fixture.m4a" --arg audio_base64 "$AUDIO_BASE64" '{filename:$filename,audio_base64:$audio_base64}')"
```

## Poll Translation

```bash
JOB_ID="<job-id>"

curl -sS https://darija-api-staging-nwjxqrn2ra-uc.a.run.app/v1/translations/${JOB_ID} \
  -H "Authorization: Bearer ${TOKEN}"
```

## Evidence To Capture

- job ID
- Trigger run ID
- first queued response status
- final status
- provider/run failure owner if any
- no token, no full transcript, no private audio
