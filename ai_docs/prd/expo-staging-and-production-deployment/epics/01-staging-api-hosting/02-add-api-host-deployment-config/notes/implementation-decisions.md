# Implementation Decisions

- Use a root `Dockerfile` instead of buildpacks so the Cloud Run runtime shape is explicit.
- Keep the runtime command as `npm run api`; do not introduce a second server entrypoint.
- Copy only `server/` and `trigger/` because `server/index.mjs` imports `../trigger/translate-audio-job.mjs`.
- Do not add Terraform, custom domains, Cloud Armor, load balancers, or production services in this task.
- Keep the public Cloud Run invoker setting for staging `/health`; authenticated API routes still require Clerk session tokens.
