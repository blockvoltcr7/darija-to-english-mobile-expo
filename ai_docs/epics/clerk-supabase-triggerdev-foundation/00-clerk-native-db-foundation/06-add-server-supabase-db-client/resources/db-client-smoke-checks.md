# DB Client Smoke Checks

## Dependency

```bash
npm install @supabase/supabase-js
```

## Static Checks

```bash
node --check server/env.mjs
node --check server/db.mjs
node --check server/index.mjs
rg -n "server/db|server/env|SUPABASE_.*KEY|SERVICE_ROLE|SECRET_KEY" app lib
```

Expected:

- `server/db.mjs` parses.
- No mobile file imports server DB/env modules.
- No secret-bearing Supabase env var is referenced from `app/` or `lib/`.

## Safe Runtime Smoke

After migrations exist and env is configured, run a read-only check from the server process or a temporary local script:

```js
const { checkSupabaseConnection } = await import('./server/db.mjs');
console.log(await checkSupabaseConnection());
```

The output should report success/failure without printing keys, URLs with credentials, or row data beyond safe counts/status fields.

