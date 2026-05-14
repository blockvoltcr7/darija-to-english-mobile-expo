# Secret Boundary Audit Commands

Run from the repo root.

```bash
npx eas-cli@latest env:list --environment development --format long
npx eas-cli@latest env:list --environment preview --format long
npx eas-cli@latest env:list --environment production --format long

rg -n "process\\.env\\.EXPO_PUBLIC_|EXPO_PUBLIC_" app lib

rg -n "OPENAI_API_KEY|DARIJA_ASR_API_KEY|DARIJA_ASR_BASE_URL|DARIJA_ASR_URL|CLERK_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY|SUPABASE_SECRET_KEY|TRIGGER_SECRET_KEY" app lib
```

Do not run EAS list commands with `--include-sensitive` for normal audit capture.
