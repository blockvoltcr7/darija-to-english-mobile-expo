# Production Resource Decisions

Production deploy is currently deferred. The production path should be documented as a decision gate, not as completed infrastructure.

## Required Decisions

| Area | Default recommendation | Risk if shared with staging |
| --- | --- | --- |
| Cloud Run service | Create `darija-api-production` separate from `darija-api-staging`. | Staging deploys, env edits, or rollback could affect store users. |
| Runtime service account | Create `darija-api-production-run@darija-to-english-expo.iam.gserviceaccount.com`. | Broad staging IAM can read production secrets or storage. |
| Secret Manager secrets | Use production-suffixed secret names. | Staging secret rotation can break production, and production values can leak into test logs. |
| Supabase project or resources | Prefer separate production project or at least separate buckets/tables/prefixes with explicit RLS review. | Test jobs can pollute production data, and destructive QA can affect real user history. |
| Clerk instance/keys | Use production Clerk keys for production app builds. | Test users and production users can mix; auth webhook behavior can drift silently. |
| Trigger runtime | Deploy production tasks with `npm run trigger:deploy:prod` and production `TRIGGER_SECRET_KEY`. | Jobs can remain queued or run on an unexpected environment. |
| Modal Darija ASR | Decide whether production uses the same endpoint or a production endpoint/version. | Provider model changes or test traffic can affect production reliability and cost attribution. |
| OpenAI account/project | Decide cost owner and production API key source. | Shared quota/spend can make production incidents harder to diagnose. |
| EAS production public env | Configure only after production API URL exists. | A production app can compile with staging or local API targets. |

## Non-Negotiable Release Gate

A production mobile build is not ready until one of these is explicitly true:

- Production API URL exists, `/health` returns the expected shape, and the production Trigger deployment path is verified.
- Production release is intentionally deferred, and store beta builds are labeled as staging-backed with shared-resource risks accepted.

## Upload-Size Risk

The current API receives base64 audio inside JSON. `server/env.mjs` defaults `AUDIO_UPLOAD_MAX_BYTES` to `50000000` and `MAX_JSON_BODY_SIZE` to `70mb`, while Cloud Run has a lower documented HTTP/1 request-size limit. Production docs should keep this as a launch risk unless upload sizes are constrained or direct-to-storage upload is implemented.
