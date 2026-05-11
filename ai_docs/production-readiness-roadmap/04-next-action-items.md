# Next Action Items

## Immediate Priority

### 1. Commit the project auth QA skill

The repo currently has a project-scoped skill at:

```text
.agents/skills/darija-mobile-auth-qa/SKILL.md
```

Action:

- Commit it so future sessions can reliably test iOS and Android Clerk auth.

### 2. Choose the production Postgres provider

Recommended decision:

- Use Supabase Postgres and Storage.
- Keep Clerk Auth.
- Configure Supabase to trust Clerk as a third-party auth provider.

Alternative:

- Use Neon Postgres and separate storage if avoiding Supabase is a hard requirement.

Decision needed:

- Are we comfortable using Supabase for database/storage while keeping Clerk for auth?

### 3. Add database migrations

Create one migration set for:

- `profiles`
- `translation_jobs`
- `translation_results`
- `provider_runs`

Implementation notes:

- Use `clerk_user_id text not null`.
- Add indexes on `clerk_user_id`, `created_at`, and `job_id`.
- Keep schema simple before adding billing complexity.
- Do not build new app tables around `auth.users`; Clerk remains the app identity source.
- Add Postgres triggers only for database-owned side effects such as `updated_at`, not for Clerk signup events.

Pre-step:

- Add the smaller `clerk-supabase-foundation` plan from `05-clerk-supabase-auth-solidification-plan.md`.
- Use a Clerk webhook plus server-side lazy profile upsert to keep `profiles` synchronized.

### 4. Add server DB client

Create:

```text
server/env.mjs
server/db.mjs
```

Tasks:

- Validate required production environment variables.
- Initialize DB connection server-side only.
- Add `getOrCreateProfile(clerkUserId)`.
- Add `recordCompletedTranslation(...)`.

Acceptance criteria:

- Existing `/v1/translate-audio` still works.
- A successful translation creates durable DB rows.

### 5. Add translation history endpoint

Create:

```text
GET /v1/translations
GET /v1/translations/:id
```

Rules:

- Require Clerk session.
- Filter every query by authenticated `clerk_user_id`.
- Return only the user's own translations.

### 6. Add translation history UI

Add either:

```text
app/history.tsx
```

or a history section on `app/account.tsx`.

MVP behavior:

- Show most recent translations.
- Open a translation detail.
- Allow copy/select text.

### 7. Host the API

Pick a production API host and deploy `server/index.mjs`.

Requirements:

- HTTPS URL.
- Server-side secrets.
- Request body limits.
- Health endpoint.
- Logs accessible by trace ID.

Then set:

```bash
EXPO_PUBLIC_API_BASE_URL=https://<production-api-host>
```

for preview and production builds.

## Next After Persistence

### 8. Move audio to object storage

Tasks:

- Add private storage bucket.
- Store original audio by user/job key.
- Save object key in `translation_jobs`.
- Add deletion/retention policy.

### 9. Convert translation to async jobs

Tasks:

- Change upload request into job creation.
- Add worker execution.
- Add job polling in app.
- Persist intermediate provider state and errors.

### 10. Add usage metering

Tasks:

- Add `usage_ledger`.
- Reserve estimated usage before provider calls.
- Finalize actual usage after completion.
- Block over-limit users before paid model calls.

### 11. Add RevenueCat subscriptions

Tasks:

- Add RevenueCat Expo packages.
- Configure iOS and Android products.
- Add paywall and restore purchases.
- Add webhook endpoint.
- Mirror entitlements into Postgres.

### 12. Add release and compliance docs

Create:

```text
docs/legal/privacy-policy.md
docs/legal/terms.md
docs/legal/support.md
docs/legal/delete-account.md
docs/beta-test-plan.md
docs/store-listing.md
eas.json
```

Include:

- Microphone usage.
- Audio/transcript retention.
- Account deletion.
- Support contact.
- Subscription terms if billing is enabled.

## Suggested First Epic

Name:

```text
production-persistence-and-history
```

Scope:

- Choose DB provider.
- Add Postgres migrations.
- Add server DB client.
- Persist completed translations.
- Add authenticated history endpoint.
- Add mobile history view.

Out of scope:

- RevenueCat.
- Async workers.
- Store submission.
- Full billing usage ledger.

Why this first:

- It gives the product durable value for users immediately.
- It creates the foundation for quotas, subscriptions, support, and async processing.
- It does not disrupt the Clerk auth flow that is already working.

## Done Criteria For The First Epic

- Authenticated user can translate audio.
- Translation is stored in Postgres.
- Same user can reopen the app and see translation history.
- Another user cannot read that history.
- Server tests or manual curl checks prove unauthorized requests are rejected.
- `node --check server/index.mjs`, `npm run typecheck`, `npm run lint`, and `npx expo-doctor` pass.
