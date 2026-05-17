# Production API Plan Review Template

This template is for reviewing the production API documentation. It is not execution evidence.

## Documentation Coverage

- [ ] Production host plan names Cloud Run or records a different host decision.
- [ ] Production service name, region, project, image naming, and runtime service account are documented.
- [ ] Env vars are listed by name only.
- [ ] Health check URL pattern and expected response shape are documented.
- [ ] Trigger production deployment dependency is explicit.
- [ ] Promotion path from staging to production is documented.
- [ ] Rollback path covers Cloud Run revision rollback and Trigger/mobile coordination.
- [ ] Shared-resource risks are explicit for Cloud Run, Supabase, Clerk, Trigger, Modal, OpenAI, and EAS env.
- [ ] Production mobile readiness gate says no production build without a production API URL decision.

## Secret Boundary Review

- [ ] No `.env` values are pasted.
- [ ] No Clerk session tokens are pasted.
- [ ] No provider keys, Supabase service keys, or Trigger secrets are pasted.
- [ ] No private audio contents or full private transcripts are pasted.
- [ ] Mobile public env contains only intentional public values such as `EXPO_PUBLIC_API_BASE_URL` and `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`.

## Deferred-State Wording

- [ ] The doc does not claim production is deployed unless a production service URL and health check are verified.
- [ ] Store beta builds are labeled staging-backed if production API is still deferred.
- [ ] Any shared staging/production infrastructure is recorded as an accepted risk with owner and mitigation.

## Review Notes

- Reviewer:
- Date:
- Production API decision:
- Production Trigger decision:
- Remaining blockers:
