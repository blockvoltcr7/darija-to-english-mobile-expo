# Convex Implementation Best Practices

Research date: 2026-05-16

## Project Structure

Keep Convex backend code in `convex/`:

- `convex/schema.ts`: table validators and indexes.
- `convex/http.ts`: public HTTP Actions.
- `convex/model/`: pure business/data helper functions.
- `convex/scoring.ts`: pure scoring helpers where practical.
- `convex/seed.ts` or scripts: reproducible seed operations.
- `convex/validation.ts`: seed and relationship validation helpers.

Run:

```bash
npx convex dev
```

Commit generated Convex TypeScript files when the project expects downstream agents or evaluators to compile locally without first regenerating everything.

## Schema and Indexes

Use `defineSchema`, `defineTable`, and `v` validators in `convex/schema.ts`. Convex adds `_id` and `_creationTime`; the assignment still requires stable business IDs like `app_001`.

Minimum index guidance:

- Add `by_user_id` on `users.userId`.
- Add `by_application_id` on `loanApplications.applicationId`.
- Add applicant indexes on profile, debt, and summary tables.
- Add application indexes on request, parsed statement, monthly summary, and risk flag tables.
- Query relationship lookups through `.withIndex()`, not unbounded table scans.

Avoid redundant indexes once real query paths settle, but do not remove an index until no deployed function depends on it.

Sources:

- https://docs.convex.dev/database/schemas
- https://docs.convex.dev/database/reading-data/indexes
- https://docs.convex.dev/understanding/best-practices

## Queries, Mutations, and Actions

Use each Convex function type narrowly:

- Queries: deterministic reads, list/detail endpoints, qualification data loading.
- Mutations: seed writes, write-time validation, future state changes.
- Actions: external side effects, OpenAI calls, webhooks, long-running work.
- HTTP Actions: public HTTP API routes and webhooks.

Keep wrapper functions thin. Put reusable logic in plain TypeScript helpers. This makes scoring easier to test and avoids overusing `ctx.runQuery` or `ctx.runMutation` from actions.

Prefer internal functions for anything called by scheduled jobs, HTTP Actions, or other Convex functions. Public functions are callable from clients and need stricter access review.

Sources:

- https://docs.convex.dev/functions
- https://docs.convex.dev/functions/actions
- https://docs.convex.dev/functions/internal-functions
- https://docs.convex.dev/understanding/best-practices

## HTTP Actions

Implement required public endpoints in `convex/http.ts` with `httpRouter()` and `httpAction()`.

Convex HTTP Actions are exposed at:

```text
https://<deployment-name>.convex.site
```

Important differences from Express:

- HTTP Actions use the Fetch `Request` and `Response` APIs.
- Convex HTTP routes are not Express route handlers.
- HTTP Actions do not use Convex `args` validators, so validate paths, queries, and bodies manually.
- Use consistent JSON error shapes for 404 and 500 responses.

For dynamic paths such as `/loan-applications/:applicationId/qualification`, either use Convex route patterns supported by the current router or parse the request URL inside a broader route pattern.

Source:

- https://docs.convex.dev/functions/http-actions

## Auth and Public Access

The assignment explicitly says no authentication is required. That is acceptable only because all data is fake and the task is an assessment.

Do not generalize this to production lending. Real lending flows require auth, authorization, audit trails, encryption, privacy review, and careful response minimization.

If auth is added later:

- Check `ctx.auth.getUserIdentity()` inside protected functions.
- Do not treat user-provided email, name, or `applicationId` as authorization proof.
- Keep agent endpoints server-side.

Sources:

- https://docs.convex.dev/auth/database-auth
- https://docs.convex.dev/understanding/best-practices

## Env and Secrets

Use Convex environment variables for server-side secrets and settings:

- `OPENAI_API_KEY`
- shared API secrets if a separate agent service is used
- allowed CORS origins if needed
- external service URLs

Prefer declaring required environment variables in `convex/convex.config.ts` for generated type safety. Values still need to be set in each deployment.

Commands:

```bash
npx convex env list
npx convex env get NAME
npx convex env set NAME 'value'
npx convex env set --from-file .env.convex
npx convex env remove NAME
```

Source:

- https://docs.convex.dev/production/environment-variables

## File Storage

File upload and bank-statement parsing are out of scope for this assignment. Seed only structured monthly summary records.

If file upload is added later:

- Use Convex file storage or dedicated object storage.
- Store storage IDs or metadata, not raw files in qualification responses.
- Avoid pushing large raw statements through the public loan qualification endpoint.

Source:

- https://docs.convex.dev/file-storage/upload-files

## Cron and Jobs

Cron jobs are not needed for the MVP. If later added for cleanup or recurring validation:

- Define jobs in `convex/crons.ts`.
- Target internal functions.
- Keep arguments backward compatible because scheduled functions run the current deployed code.

Sources:

- https://docs.convex.dev/scheduling
- https://docs.convex.dev/scheduling/scheduled-functions

## Testing

Recommended testing layers:

- Unit-test pure scoring helpers with Vitest.
- Use `convex-test` for Convex function tests.
- Use curl or an HTTP test client for required endpoint examples.
- Add a seed validation command or endpoint proving counts, relationships, cents fields, and 2/2/2/2 outcome distribution.

Source:

- https://docs.convex.dev/testing
- https://docs.convex.dev/testing/convex-test

## Common Pitfalls

- Do not use `.filter()` for indexed lookup paths.
- Do not use unbounded `.collect()` on tables that can grow.
- Await every promise.
- Validate all public function inputs.
- Review access control on every public `query`, `mutation`, `action`, and `httpAction`.
- Use internal functions for scheduled and nested Convex calls.
- Keep schema changes backward compatible once data exists.
- Do not condition function exports on environment variables.

Sources:

- https://docs.convex.dev/understanding/best-practices
- https://docs.convex.dev/production

