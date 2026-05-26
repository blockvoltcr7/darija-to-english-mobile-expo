# Source Anchors

- `ai_docs/deployment/production-api.md`: target production Cloud Run shape, current no-go state, env-name list, deploy command shape, and pause points.
- `ai_docs/deployment/api-hosting.md`: verified staging Cloud Run deploy, health, logs, and rollback command patterns to adapt.
- `ai_docs/deployment/release-checklist.md`: API target gate and rollback/post-release verification expectations.
- `server/index.mjs`: `/health`, `/health/supabase`, Clerk-authenticated `/v1/translations`, Trigger dispatch, polling routes, and error handling.
- `server/env.mjs`: runtime env validation and safe model-name defaults returned by `/health`.
- `server/db.mjs`: Supabase admin client and `/health/supabase` dependency behavior.
- `scripts/create-cloud-run-secrets.mjs`: existing secret-creation helper to inspect before adapting for production.
- `.env.example`: production-sensitive env variable names and current staging URL note.
