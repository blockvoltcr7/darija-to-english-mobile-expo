# Env Validation Checklist

## Static Checks

```bash
node --check server/env.mjs
node --check server/index.mjs
rg -n "SUPABASE_.*KEY|SERVICE_ROLE|SECRET_KEY" app lib
rg -n "EXPO_PUBLIC_SUPABASE|EXPO_PUBLIC_.*SECRET|EXPO_PUBLIC_.*SERVICE" .env.example app lib server
```

Expected:

- No mobile imports of `server/env.mjs`.
- No Supabase secret or service-role values under `EXPO_PUBLIC_*`.
- Error messages name missing variables but do not print values.

## Expected Server-Only Supabase Env

```dotenv
SUPABASE_URL=https://npjsersrmvltoxmqdkzd.supabase.co
SUPABASE_SECRET_KEY=replace-with-your-supabase-secret-key
# Optional legacy fallback only if needed:
# SUPABASE_SERVICE_ROLE_KEY=replace-with-your-legacy-service-role-key
```

## Health Response Rule

`/health` may report booleans such as:

```json
{ "dependencies": { "supabase": true } }
```

It must not return URLs, key prefixes, tokens, or secret values.
