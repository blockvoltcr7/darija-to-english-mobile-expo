# Production API Checklist

## Before Deploy

- Confirm Task 01 resource-isolation decisions are complete.
- Confirm production service name, GCP project, region, service account, image tag, max instances, timeout, and secret names.
- Confirm `TRIGGER_ENVIRONMENT=prod` is intentional and paired with the production Trigger worker plan.
- Confirm EAS production public env is still deferred until the production URL is verified.

## Deploy And Verify

- Build and deploy using the command shape in `ai_docs/deployment/production-api.md`.
- Run `curl -sS <production-url>/health`.
- Run `curl -sS <production-url>/health/supabase` after production Supabase is configured.
- Read Cloud Run logs for startup, health check, and configuration-shape lines only.
- Record revision name, service URL, region, timestamp, model names, dependency booleans, and any blockers.

## Rollback Notes

- Record previous revision or a known-good image tag.
- Use Cloud Run traffic rollback commands from `ai_docs/deployment/release-checklist.md`.
- Do not paste secret names with values or private request bodies into artifacts.
