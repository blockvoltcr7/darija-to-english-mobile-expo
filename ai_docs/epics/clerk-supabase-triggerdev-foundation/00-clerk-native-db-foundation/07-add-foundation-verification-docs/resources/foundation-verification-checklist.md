# Foundation Verification Checklist

Use this checklist after Epic 00 implementation.

## Supabase Project

All live Supabase verification must target:

```text
project_ref / project_id: npjsersrmvltoxmqdkzd
project_name: Darija To English EXPO
```

Current execution rule: use Supabase MCP for live Supabase database work. Do not use the local Supabase stack for verification, and do not use Supabase CLI for live DB operations in this repo unless this rule is explicitly changed.

## Static Code Checks

```bash
node --check server/env.mjs
node --check server/db.mjs
node --check server/index.mjs
npm run typecheck
npm run lint
```

Run `npx expo-doctor` if package or mobile config changes were made.

## API Health

```bash
npm run api
curl http://localhost:8787/health
```

Expected:

- `ok: true`
- model keys include `openai_transcription`, `consolidation`, and `translation`
- dependency booleans may include `supabase`
- no secret values, URLs with credentials, or token prefixes are returned

## Migration Checks

Use Supabase MCP:

```text
list_migrations
get_advisors type=security
execute_sql <verification SQL>
```

Do not mark live migration complete unless the migration was actually applied through Supabase MCP and verified against project ref `npjsersrmvltoxmqdkzd`.

Expected Epic 00 production migrations:

- `create_clerk_native_profiles`
- `add_db_local_updated_at_trigger`
- `harden_set_updated_at_search_path`

## DB Shape Checks

Run the verification SQL from:

- `03-create-clerk-native-profiles-migration/resources/profile-migration-verification.sql`
- `04-add-db-local-updated-at-trigger/resources/verify-updated-at-trigger.sql`

Expected:

- `public.profiles.id` is UUID primary key.
- `public.profiles.clerk_user_id` is `text not null unique`.
- `public.profiles.user_id` is absent unless a documented non-empty-table compatibility plan exists.
- No foreign key from `public.profiles` to `auth.users`.
- RLS is enabled on `public.profiles`.
- No `profiles` policy uses `auth.uid()`.
- `public.set_updated_at()` updates `profiles.updated_at` on update.
- `public.set_updated_at()` has `SET search_path TO ''`.
- No new trigger exists on `auth.users`.

## Secret Boundary Checks

```bash
rg -n "server/env|server/db" app lib
rg -n "EXPO_PUBLIC_SUPABASE|EXPO_PUBLIC_.*SECRET|EXPO_PUBLIC_.*SERVICE" .env.example app lib server
rg -n "SUPABASE_.*KEY|SERVICE_ROLE|SECRET_KEY" app lib
```

Expected:

- No mobile import of server env or DB modules.
- No Supabase secret in an `EXPO_PUBLIC_*` variable.
- No service/secret key references in mobile code.

## Known Advisor Items

Expected after Epic 00:

- `public.profiles` has RLS enabled with no policies. This is intentional while the architecture is server-mediated through the API.

Known unrelated pre-existing item:

- `public.rls_auto_enable()` may still have `SECURITY DEFINER` executable warnings. That function is outside Epic 00's Clerk-native profile foundation scope.
