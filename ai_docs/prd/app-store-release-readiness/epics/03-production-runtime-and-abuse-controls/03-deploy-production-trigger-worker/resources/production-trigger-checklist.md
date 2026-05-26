# Production Trigger Checklist

## Preflight

- Confirm production API URL and `TRIGGER_ENVIRONMENT=prod` decision.
- Confirm API and worker share the intended `TRIGGER_PROJECT_REF`.
- Confirm Trigger secret is configured only in server/worker secret stores.
- Confirm production Supabase and provider env are available to the worker.

## Deploy

- Run the repo script shape: `npm run trigger:deploy:prod`.
- Confirm the deployed task id is `translate-audio-job`.
- Record deployment version/identity without secret values.

## No-Local-Worker Verification

- Ensure no local `npm run trigger:dev` session is required for production jobs.
- Submit or observe one production run from Task 07.
- Correlate `traceId`, `jobId`, and `triggerRunId` across mobile diagnostics, API logs, Trigger logs, and Supabase row status.
- Record only statuses, durations, safe IDs, and result-field presence.
