# Epic 02 Final QA Summary

Task: `verify-history-access-controls`

Target project:

- Supabase MCP project id: `npjsersrmvltoxmqdkzd`

## Static Checks

Passed:

```text
node --check server/index.mjs
node --check server/translations.mjs
npm run typecheck
npm run lint
npx expo-doctor
```

Expo Doctor result:

```text
18/18 checks passed. No issues detected.
```

## Health Checks

Local API:

```text
GET /health
ok: true
dependencies.clerk: true
dependencies.supabase: true
models.openai_transcription: gpt-4o-mini-transcribe
models.consolidation: gpt-5.5
models.translation: gpt-5.5
```

```text
GET /health/supabase
ok: true
projectRef: npjsersrmvltoxmqdkzd
table: profiles
status: 200
rowCount: 0
```

## Unauthenticated API Checks

```text
GET /v1/translations
status: 401
body: {"error":"Unauthorized"}
```

```text
GET /v1/translations/00000000-0000-0000-0000-000000000000
status: 401
body: {"error":"Unauthorized"}
```

## Authenticated Fixture Checks

Used the same Clerk Backend API test pattern as Epic 01:

1. Created two disposable Clerk users.
2. Created one short-lived session token for the owner user.
3. Created two synthetic translation jobs directly in production Supabase through MCP:
   - one owner row for the token's `clerk_user_id`
   - one other-user row for cross-user denial
4. Called the local API with the owner token.
5. Cleaned up all synthetic rows, revoked the session, deleted the Clerk users, and removed the temporary token file.

No bearer token, Clerk secret, Supabase secret, or real transcript was printed or committed.

Results:

```text
authenticated list status: 200
authenticated list count: 1
owner row present: true
other user row present: false
own detail status: 200
own provider run count: 1
other-user detail status: 404
missing detail status: 404
```

## Supabase Cleanup Evidence

After cleanup:

```text
translation_jobs remaining rows for QA users: 0
translation_results remaining rows for QA users: 0
provider_runs remaining rows for QA users: 0
```

Final total row counts after cleanup:

```text
translation_jobs: 0
translation_results: 0
provider_runs: 0
```

## Advisor Notes

Expected info lints:

- `public.translation_jobs` has RLS enabled and no policies.
- `public.translation_results` has RLS enabled and no policies.
- `public.provider_runs` has RLS enabled and no policies.

These are expected in the current server-mediated architecture because the app
does not expose direct mobile Supabase table access.

Existing unrelated warnings remain:

- `public.rls_auto_enable()` can be executed by `anon`.
- `public.rls_auto_enable()` can be executed by `authenticated`.

## Documentation References

- Supabase RLS docs: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase API security docs: https://supabase.com/docs/guides/api/securing-your-api
- Clerk testing overview: https://clerk.com/docs/guides/development/testing/overview
