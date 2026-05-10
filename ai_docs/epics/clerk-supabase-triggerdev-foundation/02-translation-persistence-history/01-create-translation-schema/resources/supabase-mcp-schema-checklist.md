# Supabase MCP Schema Checklist

Target project:

```text
project_id: npjsersrmvltoxmqdkzd
```

Use Supabase MCP for production apply and verification. Do not use the local Supabase stack for this project.

## Preflight

- Confirm `public.profiles` exists and is Clerk-native.
- Confirm `public.set_updated_at()` exists.
- Confirm `public.translation_jobs`, `public.translation_results`, and `public.provider_runs` do not already exist, or document their current shape before modifying.

## Apply

- Apply the reviewed migration SQL to project `npjsersrmvltoxmqdkzd`.
- Capture the MCP response in `artifacts/`.

## Verify

- Table columns and constraints match the migration.
- RLS is enabled on all new tables.
- `anon` and `authenticated` have no direct table privileges.
- `service_role` has the intended privileges.
- Indexes exist for `clerk_user_id`, `job_id`, `status`, and `created_at`.
- `updated_at` triggers exist where the table has `updated_at`.
