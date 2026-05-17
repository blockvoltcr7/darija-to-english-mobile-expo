# Production Resource Decisions

Production deploy is currently deferred. The production path is documented as a decision gate, not as completed infrastructure. The repo now has `ai_docs/deployment/production-api.md` as the source runbook for this deferred state.

## Required Decisions

| Area | Current choice for this task | Human owner | Risk if shared with staging |
| --- | --- | --- | --- |
| Cloud Run service | Defer deploy; recommend `darija-api-production` separate from `darija-api-staging`. | Infrastructure owner | Staging deploys, env edits, or rollback could affect store users. |
| Runtime service account | Defer creation; recommend `darija-api-production-run@darija-to-english-expo.iam.gserviceaccount.com`. | Infrastructure owner | Broad staging IAM can read production secrets or storage. |
| Secret Manager secrets | Defer creation; use production-suffixed secret names. | Infrastructure owner | Staging secret rotation can break production, and production values can leak into test logs. |
| Supabase project or resources | Undecided; prefer separate production project or at least separate buckets/tables/prefixes with explicit RLS review. | Data owner | Test jobs can pollute production data, and destructive QA can affect real user history. |
| Clerk instance/keys | Undecided; prefer production Clerk keys for production app builds. | Auth owner | Test users and production users can mix; auth webhook behavior can drift silently. |
| Trigger runtime | Deferred; deploy production tasks with `npm run trigger:deploy:prod` only after production API and secrets are chosen. | Runtime owner | Jobs can remain queued or run on an unexpected environment. |
| Modal Darija ASR | Undecided; choose whether production uses the same endpoint or a production endpoint/version. | Provider owner | Provider model changes or test traffic can affect production reliability and cost attribution. |
| OpenAI account/project | Undecided; choose cost owner and production API key source. | Provider owner | Shared quota/spend can make production incidents harder to diagnose. |
| Convex timing | Undecided; current production API runbook assumes existing Express + Supabase path. | Product/engineering owner | Migrating after release changes the persistence and operational contract under store users. |
| Store beta against staging-backed API | Not approved by this task; allowed only as a labeled beta exception with explicit risk acceptance. | Release owner | Beta users can exercise staging API, staging data, and staging provider quotas. |
| EAS production public env | Deferred until production API URL exists. | Release owner | A production app can compile with staging or local API targets. |

## Non-Negotiable Release Gate

A production mobile build is not ready until one of these is explicitly true:

- Production API URL exists, `/health` returns the expected shape, and the production Trigger deployment path is verified.
- Production release is intentionally deferred, and store beta builds are labeled as staging-backed with shared-resource risks accepted.

## Upload-Size Risk

The current API receives base64 audio inside JSON. `server/env.mjs` defaults `AUDIO_UPLOAD_MAX_BYTES` to `50000000` and `MAX_JSON_BODY_SIZE` to `70mb`, while Cloud Run has a lower documented HTTP/1 request-size limit. Production docs should keep this as a launch risk unless upload sizes are constrained or direct-to-storage upload is implemented.
