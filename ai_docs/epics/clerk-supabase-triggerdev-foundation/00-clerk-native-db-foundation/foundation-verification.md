# Epic 00 Foundation Verification

## Scope

- Epic: `00-clerk-native-db-foundation`
- Supabase project ref / MCP `project_id`: `npjsersrmvltoxmqdkzd`
- Verification mode: production Supabase MCP for database checks; local static checks for code
- Local Supabase stack: not used

## Production Database State

Supabase MCP migrations applied:

- `create_clerk_native_profiles`
- `add_db_local_updated_at_trigger`
- `harden_set_updated_at_search_path`

Production verification confirmed:

- `public.profiles.id uuid primary key default gen_random_uuid()`
- `public.profiles.clerk_user_id text not null unique`
- `public.profiles.primary_email text`
- `public.profiles.display_name text`
- `public.profiles.image_url text`
- `public.profiles.created_at timestamptz not null default now()`
- `public.profiles.updated_at timestamptz not null default now()`
- `public.profiles.deleted_at timestamptz`
- RLS enabled on `public.profiles`
- no `public.profiles.user_id`
- no foreign key from `public.profiles` to `auth.users`
- no profile policies using `auth.uid()`
- no `auth.users -> public.handle_new_user()` trigger
- no `public.handle_new_user()` function
- `public.set_updated_at()` exists with `SET search_path TO ''`
- `public.profiles.profiles_set_updated_at` is a `BEFORE UPDATE FOR EACH ROW` trigger
- updating a temporary profile row increased `updated_at`
- temporary verification rows were deleted

## Server Foundation

Local code now includes:

- `server/env.mjs`: centralized server-only environment parsing
- `server/db.mjs`: singleton Supabase admin client and sanitized smoke helper
- `server/index.mjs`: health response includes a Supabase configured boolean and a sanitized `/health/supabase` endpoint
- `.env.example`: server-only Supabase placeholders for project `npjsersrmvltoxmqdkzd`

The mobile app still calls the API. No `app/` or `lib/` file imports `server/env.mjs` or `server/db.mjs`.

## Verification Commands

Static checks:

```bash
node --check server/env.mjs
node --check server/db.mjs
node --check server/index.mjs
npm run typecheck
npm run lint
npx expo-doctor
```

API health:

```bash
npm run api
curl http://localhost:8787/health
```

Expected health shape:

- `ok: true`
- `dependencies.clerk`
- `dependencies.darija_asr`
- `dependencies.openai`
- `dependencies.supabase`
- `models.openai_transcription`
- `models.consolidation`
- `models.translation`

Do not print or return secret values, key prefixes, or credential-bearing URLs.

Supabase production checks must use Supabase MCP:

```text
list_migrations
get_advisors type=security
execute_sql <DB shape and trigger verification SQL>
```

## Known Residual Advisor Items

Expected:

- `public.profiles` has RLS enabled with no policies. This is intentional for the current server-mediated architecture; direct mobile-to-Supabase RLS is out of scope for Epic 00.

Unrelated:

- `public.rls_auto_enable()` has existing security-definer advisor warnings. Epic 00 did not change that function because it is outside the Clerk-native profile foundation scope.

## Handoff To Epic 01

Epic 01 can now build profile sync around:

- Clerk as the identity source
- `profiles.clerk_user_id` as the app ownership key
- server-only Supabase access through `server/db.mjs`
- database-local timestamp behavior through `public.set_updated_at()`
