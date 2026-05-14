# Staging Environment Checklist

Values are intentionally omitted.

| Variable | Source | Status |
| --- | --- | --- |
| `CLERK_PUBLISHABLE_KEY` | `.env.local` | present locally; configured as Secret Manager secret |
| `CLERK_SECRET_KEY` | `.env.local` | present locally; configured as Secret Manager secret |
| `SUPABASE_URL` | `.env.local` | present locally; configured as Secret Manager secret |
| `SUPABASE_SECRET_KEY` | `.env.local` | present locally; configured as Secret Manager secret |
| `OPENAI_API_KEY` | `.env.local` | present locally; configured as Secret Manager secret |
| `DARIJA_ASR_BASE_URL` | `.env.local` | present locally; configured as Secret Manager secret |
| `DARIJA_ASR_API_KEY` | `.env.local` | present locally; configured as Secret Manager secret |
| `TRIGGER_SECRET_KEY` | `.env.local` | present locally; configured as Secret Manager secret |
| `NODE_ENV` | direct Cloud Run env var | `production` |
| `HOST` | direct Cloud Run env var | `0.0.0.0` |
| `TRIGGER_ENVIRONMENT` | direct Cloud Run env var | `staging` |

`SUPABASE_SERVICE_ROLE_KEY` is present locally but the deployed API uses the preferred `SUPABASE_SECRET_KEY` name from `server/env.mjs`.

`TRIGGER_PROJECT_REF` is not set locally. `server/env.mjs` has a default project ref, so no staging override was configured in this task.

## GCP State

- Artifact Registry repository `darija-api`: created.
- Secret Manager secrets: created or updated with new versions.
- Runtime service account: `darija-api-staging-run@darija-to-english-expo.iam.gserviceaccount.com`.
- Runtime service account IAM: granted `roles/secretmanager.secretAccessor` on project `darija-to-english-expo`.
