# Release Rollback Command Checklist

Template only. Replace placeholders and record sanitized outcomes in the final release checklist review.

## Pre-Release Snapshot

- [ ] Record Git commit SHA: `git rev-parse HEAD`
- [ ] Record EAS build profile and build IDs:

```bash
eas build:list --platform all --limit 10
```

- [ ] Record EAS Update channel/branch state before publishing an update:

```bash
eas channel:list
eas branch:list
eas update:list --branch <branch-name> --limit 10
```

- [ ] Record Cloud Run current revision:

```bash
gcloud run revisions list \
  --service <api-service-name> \
  --region <region>
```

- [ ] Record API health:

```bash
curl -sS <api-url>/health
```

- [ ] Record Trigger.dev deployed version or local Development worker state from the Trigger dashboard or CLI output.

## EAS Update Rollback

- [ ] Confirm the bad change is JavaScript-only and compatible with the installed native runtime.
- [ ] Prefer official rollback flow:

```bash
eas update:rollback
```

- [ ] If publishing a hotfix instead, target the intended channel or branch only:

```bash
eas update --channel <preview|staging|production> --message "<sanitized rollback or hotfix summary>"
```

- [ ] Verify the affected build receives the intended update and does not cross channels.

## Mobile Store Build Rollback

- [ ] If the issue is in native code, permissions, bundle identity, or runtime compatibility, treat EAS Update rollback as insufficient.
- [ ] Stop broader rollout in App Store Connect or Google Play Console if available.
- [ ] Promote or resubmit the last known-good store build if the store allows it.
- [ ] Otherwise build and submit a fixed binary with an incremented native version.

## API Host Rollback

```bash
gcloud run revisions list \
  --service <api-service-name> \
  --region <region>

gcloud run services update-traffic <api-service-name> \
  --region <region> \
  --to-revisions <known-good-revision>=100
```

- [ ] Re-run `/health`.
- [ ] Confirm authenticated translation submit/polling still reaches the expected Trigger environment.

## Trigger Worker Rollback

- [ ] Use Trigger.dev dashboard rollback to set a previous deployment as current for new runs.
- [ ] For already-started bad runs, decide whether to cancel and replay after rollback.
- [ ] If production deployment is not active yet, use the documented local worker recovery path:

```bash
npm run trigger:dev -- --env-file .env.local --skip-update-check
```

## Environment Mistake Recovery

- [ ] Identify whether the mistake is mobile public env, API host env, Trigger env, provider env, or store config.
- [ ] Do not paste secret values into docs.
- [ ] For mobile public env mistakes, rebuild/resubmit if the value was baked into a binary.
- [ ] For API host secrets, update Secret Manager or service env, redeploy or restart as required, then verify `/health`.
- [ ] For Trigger env mistakes, update Trigger environment variables and redeploy or restart the worker path before replaying jobs.

## Provider Outage Or Modal/OpenAI Failure

- [ ] Pause release rollout if provider failures affect fresh translations.
- [ ] Capture sanitized `traceId`, `jobId`, `triggerRunId`, provider name, status, and timestamp.
- [ ] Do not re-run paid jobs repeatedly without deciding owner, cost, and user impact.
- [ ] Confirm app UI presents a failed state instead of indefinite queued/running state.
